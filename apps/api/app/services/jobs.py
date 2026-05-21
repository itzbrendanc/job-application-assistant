from __future__ import annotations

from sqlalchemy.orm import Session

from app.models.job import Job
from app.models.job_source import JobSource


def ensure_job_source(db: Session, *, name: str) -> JobSource:
    row = db.query(JobSource).filter(JobSource.name == name).one_or_none()
    if row:
        return row
    row = JobSource(name=name, mode="manual_export", policy={})
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


def create_job(
    db: Session,
    *,
    job_source: str | None,
    external_job_id: str | None,
    source_url: str | None,
    company_name: str,
    title: str,
    location_text: str | None,
    remote_type: str,
    salary_min: int | None,
    salary_max: int | None,
    salary_currency: str | None,
    description_raw: str,
) -> Job:
    source_id = None
    if job_source:
        source = ensure_job_source(db, name=job_source)
        source_id = source.id
    job = Job(
        job_source_id=source_id,
        external_job_id=external_job_id,
        source_url=source_url,
        company_name=company_name,
        title=title,
        location_text=location_text,
        remote_type=remote_type,
        salary_min=salary_min,
        salary_max=salary_max,
        salary_currency=salary_currency,
        description_raw=description_raw,
        description_normalized={},
        requirements={},
    )
    db.add(job)
    db.commit()
    db.refresh(job)
    return job

