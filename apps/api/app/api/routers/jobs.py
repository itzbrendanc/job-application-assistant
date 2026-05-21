from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.job import Job
from app.schemas.job import JobCreate, JobFitOut, JobOut
from app.services.audit import log_event
from app.services.facts import load_approved_facts
from app.services.fit import compute_fit
from app.services.jobs import create_job

router = APIRouter(prefix="/api/jobs", tags=["jobs"])


@router.post("", response_model=JobOut)
def create(payload: JobCreate, db: Session = Depends(get_db), user=Depends(get_current_user)) -> JobOut:
    job = create_job(db, **payload.model_dump())
    log_event(db, user_id=user.id, application_id=None, actor_type="user", event_type="job.created", event_payload={"job_id": str(job.id)})
    return JobOut(id=str(job.id), **payload.model_dump())


@router.get("/{job_id}", response_model=JobOut)
def get_job(job_id: str, db: Session = Depends(get_db), user=Depends(get_current_user)) -> JobOut:
    job = db.query(Job).filter(Job.id == job_id).one_or_none()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return JobOut(
        id=str(job.id),
        job_source=None,
        external_job_id=job.external_job_id,
        source_url=job.source_url,
        company_name=job.company_name,
        title=job.title,
        location_text=job.location_text,
        remote_type=job.remote_type,
        salary_min=job.salary_min,
        salary_max=job.salary_max,
        salary_currency=job.salary_currency,
        description_raw=job.description_raw,
    )


@router.get("/{job_id}/fit", response_model=JobFitOut)
def get_fit(job_id: str, db: Session = Depends(get_db), user=Depends(get_current_user)) -> JobFitOut:
    job = db.query(Job).filter(Job.id == job_id).one_or_none()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    # For now, approved facts are derived from profile_facts; profile editing/approval UI comes later.
    profile_id = user.profile.id if user.profile else None
    approved_facts = load_approved_facts(db, profile_id=profile_id) if profile_id else {}
    match = compute_fit(db, user_id=user.id, job=job, approved_facts=approved_facts)
    exp = match.explanation or {}
    return JobFitOut(
        job_id=str(job.id),
        user_id=str(user.id),
        score=float(match.score),
        match_reasons=exp.get("match_reasons", []),
        mismatch_reasons=exp.get("mismatch_reasons", []),
        uncertainties=exp.get("uncertainties", []),
    )

