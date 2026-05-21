from __future__ import annotations

from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.orm import Session

from app.core.security import decode_access_token
from app.db.session import get_db
from app.schemas.telemetry.analytics import AnalyticsIn, AnalyticsOut, ALLOWED_EVENTS
from app.schemas.telemetry.feedback import FeedbackIn, FeedbackOut
from app.services.telemetry.store import store_analytics_event, store_feedback

router = APIRouter(prefix="/api/telemetry", tags=["telemetry"])


def _user_id_from_auth(authorization: str | None) -> str | None:
    if not authorization:
        return None
    if not authorization.lower().startswith("bearer "):
        return None
    token = authorization.split(" ", 1)[1].strip()
    try:
        payload = decode_access_token(token)
        return payload.get("sub")
    except Exception:
        return None


@router.post("/analytics", response_model=AnalyticsOut)
def analytics(
    payload: AnalyticsIn,
    db: Session = Depends(get_db),
    authorization: str | None = Header(default=None),
) -> AnalyticsOut:
    if payload.event_name not in ALLOWED_EVENTS:
        raise HTTPException(status_code=400, detail="Invalid event name")
    user_id = _user_id_from_auth(authorization)
    # Guardrail: accept and store minimal properties only. Callers must not send PII/resume text/payment info.
    store_analytics_event(
        db,
        user_id=user_id,
        anonymous_id=payload.anonymous_id,
        event_name=payload.event_name,
        properties=payload.properties or {},
        source=payload.source,
    )
    return AnalyticsOut(ok=True)


@router.post("/feedback", response_model=FeedbackOut)
def feedback(payload: FeedbackIn, db: Session = Depends(get_db)) -> FeedbackOut:
    store_feedback(
        db,
        email=payload.email,
        category=payload.category,
        message=payload.message,
        rating=payload.rating,
        source_page=payload.source_page,
    )
    return FeedbackOut(ok=True)

