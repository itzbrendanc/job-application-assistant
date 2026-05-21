from __future__ import annotations

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from fastapi.responses import Response
from sqlalchemy.orm import Session
from uuid import UUID

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.application import Application
from app.models.job import Job
from app.schemas.application import AnswerUpsert, ApplicationCreate, ApplicationOut, ApplicationUpdate, SubmitRequest
from app.services.approval import determine_if_sensitive
from app.services.applications import create_application, finalize_review_packet, submit_application, upsert_answer
from app.services.audit import log_event
from app.services.xlsx_tracker import export_applications_xlsx, import_applications_xlsx
from app.services.billing.subscriptions import get_or_create_subscription_row
from app.services.billing.usage import record_usage, require_active_subscription_or_free_quota
from app.services.telemetry.store import store_analytics_event

router = APIRouter(prefix="/api/applications", tags=["applications"])


@router.post("", response_model=ApplicationOut)
def create(payload: ApplicationCreate, db: Session = Depends(get_db), user=Depends(get_current_user)) -> ApplicationOut:
    try:
        job_uuid = UUID(payload.job_id)
    except Exception as e:  # noqa: BLE001
        raise HTTPException(status_code=400, detail="Invalid job_id") from e
    row = create_application(
        db,
        user_id=user.id,
        job_id=job_uuid,
        source_mode=payload.source_mode,
        application_source=payload.application_source,
        resume_version=payload.resume_version,
        cover_letter_version=payload.cover_letter_version,
    )
    return ApplicationOut(
        id=str(row.id),
        user_id=str(row.user_id),
        job_id=str(row.job_id),
        status=row.status,
        source_mode=row.source_mode,
        application_source=row.application_source,
        resume_version=row.resume_version,
        cover_letter_version=row.cover_letter_version,
        follow_up_date=row.follow_up_date.isoformat() if row.follow_up_date else None,
        recruiter_contact=row.recruiter_contact,
        notes=row.notes,
        submitted_by_extension=row.submitted_by_extension,
    )


@router.get("", response_model=list[ApplicationOut])
def list_apps(db: Session = Depends(get_db), user=Depends(get_current_user)) -> list[ApplicationOut]:
    rows = db.query(Application).filter(Application.user_id == user.id).order_by(Application.created_at.desc()).all()
    return [
        ApplicationOut(
            id=str(r.id),
            user_id=str(r.user_id),
            job_id=str(r.job_id),
            status=r.status,
            source_mode=r.source_mode,
            application_source=r.application_source,
            resume_version=r.resume_version,
            cover_letter_version=r.cover_letter_version,
            follow_up_date=r.follow_up_date.isoformat() if r.follow_up_date else None,
            recruiter_contact=r.recruiter_contact,
            notes=r.notes,
            submitted_by_extension=r.submitted_by_extension,
        )
        for r in rows
    ]


@router.patch("/{application_id}", response_model=ApplicationOut)
def update_app(
    application_id: str,
    payload: ApplicationUpdate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
) -> ApplicationOut:
    app = db.query(Application).filter(Application.id == application_id, Application.user_id == user.id).one_or_none()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    data = payload.model_dump(exclude_unset=True)
    for k, v in data.items():
        setattr(app, k, v)
    db.commit()
    db.refresh(app)
    log_event(db, user_id=user.id, application_id=app.id, actor_type="user", event_type="application.updated", event_payload=data)
    return ApplicationOut(
        id=str(app.id),
        user_id=str(app.user_id),
        job_id=str(app.job_id),
        status=app.status,
        source_mode=app.source_mode,
        application_source=app.application_source,
        resume_version=app.resume_version,
        cover_letter_version=app.cover_letter_version,
        follow_up_date=app.follow_up_date.isoformat() if app.follow_up_date else None,
        recruiter_contact=app.recruiter_contact,
        notes=app.notes,
        submitted_by_extension=app.submitted_by_extension,
    )


@router.post("/{application_id}/answers")
def upsert(
    application_id: str,
    payload: AnswerUpsert,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
) -> dict:
    decision = determine_if_sensitive(payload.question_text)
    doc = payload.model_dump()
    if decision.needs_user_approval:
        doc["is_sensitive"] = True
        doc["needs_user_approval"] = True
        doc["approval_status"] = "pending"
    row = upsert_answer(db, user_id=user.id, application_id=application_id, payload=doc)
    return {"id": str(row.id), "needsUserApproval": row.needs_user_approval, "reason": decision.reason}


@router.post("/{application_id}/final-review")
def final_review(application_id: str, db: Session = Depends(get_db), user=Depends(get_current_user)) -> dict:
    app = db.query(Application).filter(Application.id == application_id, Application.user_id == user.id).one_or_none()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    app = finalize_review_packet(db, user_id=user.id, application=app)
    return {"applicationId": str(app.id), "status": app.status, "reviewPacket": app.review_packet}


@router.post("/{application_id}/submit")
def submit(application_id: str, payload: SubmitRequest, db: Session = Depends(get_db), user=Depends(get_current_user)) -> dict:
    app = db.query(Application).filter(Application.id == application_id, Application.user_id == user.id).one_or_none()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    app = submit_application(db, user_id=user.id, application=app, user_confirmed=payload.user_confirmed)
    log_event(db, user_id=user.id, application_id=app.id, actor_type="user", event_type="application.submit_clicked", event_payload={})
    return {"applicationId": str(app.id), "status": app.status, "submittedAt": app.submitted_at}


@router.get("/export/xlsx")
def export_xlsx(db: Session = Depends(get_db), user=Depends(get_current_user)) -> Response:
    sub = get_or_create_subscription_row(db, user_id=user.id)
    require_active_subscription_or_free_quota(db, user_id=user.id, subscription=sub, event_type="tracker.export_xlsx")
    apps = db.query(Application).filter(Application.user_id == user.id).order_by(Application.created_at.desc()).all()
    content, filename = export_applications_xlsx(apps)
    log_event(
        db,
        user_id=user.id,
        application_id=None,
        actor_type="user",
        event_type="applications.export_xlsx",
        event_payload={"count": len(apps), "filename": filename},
    )
    record_usage(db, user_id=user.id, event_type="tracker.export_xlsx", metadata={"count": len(apps)})
    store_analytics_event(
        db,
        user_id=user.id,
        anonymous_id=None,
        event_name="excel_exported",
        properties={"count": len(apps)},
        source="backend",
    )
    return Response(
        content=content,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.post("/import/xlsx")
async def import_xlsx(file: UploadFile = File(...), db: Session = Depends(get_db), user=Depends(get_current_user)) -> dict:
    raw = await file.read()
    imported = import_applications_xlsx(raw)
    # MVP: store imported records as notes-only stubs for tracking; user can reconcile later.
    created = 0
    for row in imported:
        job = Job(
            job_source_id=None,
            external_job_id=None,
            source_url=row["job_url"],
            company_name=row["company"] or "Unknown",
            title=row["job_title"] or "Unknown role",
            location_text=row["location"] or None,
            remote_type=row["workplace_type"] or "unknown",
            salary_min=None,
            salary_max=None,
            salary_currency=None,
            description_raw=row["job_url"],
            description_normalized={},
            requirements={},
        )
        db.add(job)
        db.flush()
        app = Application(
            user_id=user.id,
            job_id=job.id,
            status=row["status"],
            source_mode="manual_export",
            application_source=row["source_website"],
            resume_version=row["resume_version"],
            cover_letter_version=row["cover_letter_version"],
            submitted_by_extension=row["submitted_by_extension"],
            recruiter_contact=row["recruiter_contact"],
            notes=row["notes"],
            review_packet={"job_meta": row},
        )
        db.add(app)
        created += 1
    db.commit()
    log_event(
        db,
        user_id=user.id,
        application_id=None,
        actor_type="user",
        event_type="applications.import_xlsx",
        event_payload={"created": created, "filename": file.filename},
    )
    return {"ok": True, "created": created}
