from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.application import Application
from app.models.job import Job
from app.schemas.extension.applications import DraftApplicationRequest, DraftApplicationResponse, RecordApplicationRequest
from app.schemas.extension.forms import FormDetectRequest, MapFieldsRequest, MapFieldsResponse, SuggestAnswersRequest, SuggestAnswersResponse
from app.services.audit import log_event
from app.services.cover_letters import generate_cover_letter
from app.services.facts import load_approved_facts
from app.services.fit import compute_fit
from app.services.jobs import create_job
from app.services.extension.forms import map_fields as map_fields_impl, suggest_answers as suggest_answers_impl
from app.services.billing.subscriptions import get_or_create_subscription_row
from app.services.billing.usage import record_usage, require_active_subscription_or_free_quota
from app.services.telemetry.store import store_analytics_event

router = APIRouter(prefix="/api/extension", tags=["extension"])


@router.get("/profile/approved-facts")
def get_approved_facts(db: Session = Depends(get_db), user=Depends(get_current_user)) -> dict:
    profile_id = user.profile.id if user.profile else None
    approved = load_approved_facts(db, profile_id=profile_id) if profile_id else {}
    # Flatten a safe subset for extension use.
    flattened = {
        "full_name": (user.profile.full_name if user.profile else None),
        "linkedin_url": (user.profile.linkedin_url if user.profile else None),
        "portfolio_url": (user.profile.portfolio_url if user.profile else None),
    }
    # Skills fact example shape: [{"key":"skills","value":{"skills":[...]}}]
    skills_rows = approved.get("skills", [])
    if skills_rows:
        flattened["skills"] = skills_rows[0].get("value", {}).get("skills", [])
    return {"approvedProfile": flattened, "approvedFacts": approved}


@router.post("/jobs/detect")
def detect_job(payload: FormDetectRequest, db: Session = Depends(get_db), user=Depends(get_current_user)) -> dict:
    # MVP: create a Job record from what the extension saw.
    job = create_job(
        db,
        job_source=payload.source_website,
        external_job_id=None,
        source_url=payload.job_url,
        company_name=payload.company or "Unknown",
        title=payload.job_title or "Unknown role",
        location_text=payload.location,
        remote_type="unknown",
        salary_min=None,
        salary_max=None,
        salary_currency=None,
        description_raw=payload.job_url,  # placeholder until we scrape via allowed methods
    )
    log_event(
        db,
        user_id=user.id,
        application_id=None,
        actor_type="system",
        event_type="extension.job_detected",
        event_payload={"job_id": str(job.id), "job_url": payload.job_url, "source": payload.source_website},
    )
    store_analytics_event(
        db,
        user_id=user.id,
        anonymous_id=None,
        event_name="job_detected",
        properties={"source": payload.source_website},
        source="backend",
    )

    # Compute fit using approved facts (may be empty in starter).
    profile_id = user.profile.id if user.profile else None
    approved = load_approved_facts(db, profile_id=profile_id) if profile_id else {}
    compute_fit(db, user_id=user.id, job=job, approved_facts=approved)

    return {"jobId": str(job.id)}


@router.post("/applications/draft", response_model=DraftApplicationResponse)
def draft_application(payload: DraftApplicationRequest, db: Session = Depends(get_db), user=Depends(get_current_user)) -> DraftApplicationResponse:
    # Requires a job_id (preferred) or will create a new Job record.
    job_uuid: UUID | None = None
    if payload.job_id:
        try:
            job_uuid = UUID(payload.job_id)
        except Exception as e:  # noqa: BLE001
            raise HTTPException(status_code=400, detail="Invalid job_id") from e
        exists = db.query(Job).filter(Job.id == job_uuid).one_or_none()
        if not exists:
            raise HTTPException(status_code=404, detail="Job not found")

    if not job_uuid:
        job = create_job(
            db,
            job_source=payload.source_website,
            external_job_id=None,
            source_url=payload.job_url,
            company_name=payload.company or "Unknown",
            title=payload.job_title or "Unknown role",
            location_text=payload.location,
            remote_type="unknown",
            salary_min=None,
            salary_max=None,
            salary_currency=None,
            description_raw=payload.job_url,
        )
        job_uuid = job.id

    app = Application(
        user_id=user.id,
        job_id=job_uuid,
        status="draft",
        source_mode="browser_assist",
        application_source=payload.source_website,
        resume_version=payload.resume_version,
        cover_letter_version=payload.cover_letter_version,
        submitted_by_extension=False,
        review_packet={},
    )
    db.add(app)
    db.commit()
    db.refresh(app)
    log_event(
        db,
        user_id=user.id,
        application_id=app.id,
        actor_type="system",
        event_type="extension.application_drafted",
        event_payload={"application_id": str(app.id), "job_url": payload.job_url},
    )
    return DraftApplicationResponse(application_id=str(app.id), status=app.status)


@router.post("/applications/record")
def record_application(payload: RecordApplicationRequest, db: Session = Depends(get_db), user=Depends(get_current_user)) -> dict:
    app = db.query(Application).filter(Application.id == payload.application_id, Application.user_id == user.id).one_or_none()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    sub = get_or_create_subscription_row(db, user_id=user.id)
    require_active_subscription_or_free_quota(db, user_id=user.id, subscription=sub, event_type="application.record")
    # Guardrail: recording is not submission. It logs and updates tracker fields only.
    app.status = payload.status
    app.submitted_by_extension = bool(payload.submitted_by_extension)
    app.notes = payload.notes
    app.recruiter_contact = payload.recruiter_contact
    app.review_packet = payload.review_packet or app.review_packet
    db.commit()
    db.refresh(app)
    log_event(
        db,
        user_id=user.id,
        application_id=app.id,
        actor_type="user",
        event_type="extension.application_recorded",
        event_payload={"status": app.status, "submitted_by_extension": app.submitted_by_extension},
    )
    record_usage(db, user_id=user.id, event_type="application.record", metadata={"application_id": str(app.id)})
    store_analytics_event(
        db,
        user_id=user.id,
        anonymous_id=None,
        event_name="application_recorded",
        properties={"application_id": str(app.id), "status": app.status},
        source="backend",
    )
    return {"ok": True, "applicationId": str(app.id)}


@router.post("/forms/map-fields", response_model=MapFieldsResponse)
def map_fields(payload: MapFieldsRequest, db: Session = Depends(get_db), user=Depends(get_current_user)) -> MapFieldsResponse:
    mapped = map_fields_impl([f.model_dump() for f in payload.fields])
    log_event(
        db,
        user_id=user.id,
        application_id=None,
        actor_type="system",
        event_type="extension.form_fields_mapped",
        event_payload={"count": len(mapped)},
    )
    return MapFieldsResponse(mapped=mapped)  # type: ignore[arg-type]


@router.post("/forms/suggest-answers", response_model=SuggestAnswersResponse)
def suggest_answers(payload: SuggestAnswersRequest, db: Session = Depends(get_db), user=Depends(get_current_user)) -> SuggestAnswersResponse:
    sub = get_or_create_subscription_row(db, user_id=user.id)
    require_active_subscription_or_free_quota(db, user_id=user.id, subscription=sub, event_type="extension.autofill")

    profile_id = user.profile.id if user.profile else None
    approved = load_approved_facts(db, profile_id=profile_id) if profile_id else {}
    approved_profile = {
        "full_name": (user.profile.full_name if user.profile else None),
        "linkedin_url": (user.profile.linkedin_url if user.profile else None),
        "portfolio_url": (user.profile.portfolio_url if user.profile else None),
    }
    skills_rows = approved.get("skills", [])
    if skills_rows:
        approved_profile["skills"] = skills_rows[0].get("value", {}).get("skills", [])

    suggested = suggest_answers_impl(mapped=[m.model_dump() for m in payload.mapped], approved_profile=approved_profile)

    # Tailored cover letter (editable in extension UI). Uses only approved facts.
    cover_letter_markdown = generate_cover_letter(
        db,
        user_id=user.id,
        job_id=None,
        job_description=payload.job_description or "",
        approved_facts=approved,
    ).body_markdown

    # Audit: suggestions for autofill count as sensitive surface area.
    log_event(
        db,
        user_id=user.id,
        application_id=None,
        actor_type="system",
        event_type="extension.answers_suggested",
        event_payload={"count": len(suggested)},
    )
    record_usage(db, user_id=user.id, event_type="extension.autofill", metadata={"count": len(suggested)})
    return SuggestAnswersResponse(
        suggested=suggested,  # type: ignore[arg-type]
        cover_letter_markdown=cover_letter_markdown,
        resume_version=None,
    )
