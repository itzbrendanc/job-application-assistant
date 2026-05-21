from __future__ import annotations

from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

from app.core.rate_limit import Limit, rate_limit
from app.db.session import get_db
from app.models.beta.waitlist_entry import WaitlistEntry
from app.schemas.waitlist import WaitlistCreateRequest
from app.services.telemetry.store import store_analytics_event

router = APIRouter(prefix="/api/waitlist", tags=["waitlist"])


@router.post("")
def create_waitlist_entry(payload: WaitlistCreateRequest, request: Request, db: Session = Depends(get_db)) -> dict:
    rate_limit(request=request, key="waitlist.create", limit=Limit(requests=30, window_seconds=60))

    email = payload.email.strip().lower()
    existing = db.query(WaitlistEntry).filter(WaitlistEntry.email == email).one_or_none()
    if existing:
        # Idempotent for beta: don't leak whether an email is already on file.
        return {"ok": True}

    entry = WaitlistEntry(email=email, role=payload.role, job_search_status=payload.job_search_status, source=payload.source)
    db.add(entry)
    db.commit()

    # Analytics signal: do not include raw email in properties.
    try:
        store_analytics_event(
            db,
            user_id=None,
            anonymous_id=None,
            event_name="signup_started",
            properties={"surface": "waitlist", "source": payload.source},
            source="backend",
        )
    except Exception:
        # Never block waitlist capture if analytics fails.
        pass

    return {"ok": True}
