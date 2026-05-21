from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.job import Job
from app.services.audit import log_event
from app.services.cover_letters import generate_cover_letter
from app.services.facts import load_approved_facts

router = APIRouter(prefix="/api/cover-letters", tags=["cover_letters"])


@router.post("/generate")
def generate(job_id: str | None = None, db: Session = Depends(get_db), user=Depends(get_current_user)) -> dict:
    description = ""
    job_uuid = None
    if job_id:
        job = db.query(Job).filter(Job.id == job_id).one_or_none()
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")
        description = job.description_raw
        job_uuid = job.id

    profile_id = user.profile.id if user.profile else None
    approved = load_approved_facts(db, profile_id=profile_id) if profile_id else {}
    letter = generate_cover_letter(db, user_id=user.id, job_id=job_uuid, job_description=description, approved_facts=approved)
    log_event(db, user_id=user.id, application_id=None, actor_type="system", event_type="cover_letter.generated", event_payload={"cover_letter_id": str(letter.id)})
    return {"id": str(letter.id), "bodyMarkdown": letter.body_markdown}
