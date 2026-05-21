from __future__ import annotations

from uuid import UUID

from sqlalchemy.orm import Session

from app.models.job_match import JobMatch
from app.models.job import Job
from app.services.ai.base import ApprovedFacts
from app.services.ai.stub import StubJobFitScorer


def compute_fit(db: Session, *, user_id: UUID, job: Job, approved_facts: dict) -> JobMatch:
    scorer = StubJobFitScorer()
    result = scorer.score(job_description=job.description_raw, approved_facts=ApprovedFacts(approved_facts))

    existing = db.query(JobMatch).filter(JobMatch.user_id == user_id, JobMatch.job_id == job.id).one_or_none()
    if existing:
        existing.score = float(result["score"])
        existing.explanation = result
        db.commit()
        db.refresh(existing)
        return existing

    row = JobMatch(user_id=user_id, job_id=job.id, score=float(result["score"]), explanation=result)
    db.add(row)
    db.commit()
    db.refresh(row)
    return row

