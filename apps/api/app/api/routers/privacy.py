from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.services.audit import log_event

router = APIRouter(prefix="/api/privacy", tags=["privacy"])


@router.post("/export")
def export_data(db: Session = Depends(get_db), user=Depends(get_current_user)) -> dict:
    # Stub: implement a background export job and signed download link.
    log_event(db, user_id=user.id, application_id=None, actor_type="user", event_type="privacy.export_requested", event_payload={})
    return {"status": "stubbed"}


@router.delete("/data")
def delete_data(db: Session = Depends(get_db), user=Depends(get_current_user)) -> dict:
    # Stub: implement deletion workflow + retention rules.
    log_event(db, user_id=user.id, application_id=None, actor_type="user", event_type="privacy.deletion_requested", event_payload={})
    return {"status": "stubbed"}

