from __future__ import annotations

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.resume import Resume
from app.models.user_profile import UserProfile
from app.schemas.profile import ProfileOut, ProfileUpdate
from app.services.audit import log_event
from app.services.resume import parse_resume

router = APIRouter(prefix="/api/profile", tags=["profile"])


@router.get("", response_model=ProfileOut)
def get_profile(db: Session = Depends(get_db), user=Depends(get_current_user)) -> ProfileOut:
    profile = db.query(UserProfile).filter(UserProfile.user_id == user.id).one()
    return ProfileOut(id=str(profile.id), user_id=str(profile.user_id), **profile.__dict__)


@router.patch("", response_model=ProfileOut)
def update_profile(payload: ProfileUpdate, db: Session = Depends(get_db), user=Depends(get_current_user)) -> ProfileOut:
    profile = db.query(UserProfile).filter(UserProfile.user_id == user.id).one()
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(profile, k, v)
    db.commit()
    db.refresh(profile)
    log_event(db, user_id=user.id, application_id=None, actor_type="user", event_type="profile.updated", event_payload={})
    return ProfileOut(id=str(profile.id), user_id=str(profile.user_id), **profile.__dict__)


@router.post("/resume/upload")
async def upload_resume(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
) -> dict:
    raw = await file.read()
    try:
        text = raw.decode("utf-8", errors="ignore")
    except Exception as e:  # noqa: BLE001
        raise HTTPException(status_code=400, detail="Unable to read resume") from e

    resume = Resume(user_id=user.id, filename=file.filename or "resume.txt", content_text=text)
    db.add(resume)
    db.commit()
    db.refresh(resume)

    parsed = parse_resume(db, resume=resume)

    log_event(
        db,
        user_id=user.id,
        application_id=None,
        actor_type="system",
        event_type="resume.parsed",
        event_payload={"resume_id": str(resume.id)},
    )
    return {"resumeId": str(resume.id), "parsedResumeDataId": str(parsed.id), "skills": parsed.skills}


@router.post("/ingest/linkedin")
def ingest_linkedin_stub(db: Session = Depends(get_db), user=Depends(get_current_user)) -> dict:
    # Stub for official OAuth-based LinkedIn ingestion.
    # Guardrail: only use least-privilege OAuth and comply with terms.
    log_event(
        db,
        user_id=user.id,
        application_id=None,
        actor_type="system",
        event_type="linkedin.ingest_stub",
        event_payload={"note": "Not implemented. Use official APIs and user consent."},
    )
    return {"status": "stubbed"}

