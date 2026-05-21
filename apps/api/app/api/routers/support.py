from __future__ import annotations

from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

from app.core.rate_limit import Limit, rate_limit
from app.db.session import get_db
from app.models.support.support_message import SupportMessage, SupportMessageStatus
from app.schemas.support import SupportCreateRequest

router = APIRouter(prefix="/api/support", tags=["support"])


@router.post("")
def create_support_message(payload: SupportCreateRequest, request: Request, db: Session = Depends(get_db)) -> dict:
    rate_limit(request=request, key="support.create", limit=Limit(requests=20, window_seconds=60))

    msg = SupportMessage(
        email=payload.email.strip().lower(),
        subject=payload.subject.strip(),
        message=payload.message.strip(),
        status=SupportMessageStatus.open,
        internal_note=None,
    )
    db.add(msg)
    db.commit()
    return {"ok": True}

