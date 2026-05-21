from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.api.admin_deps import require_admin
from app.core.rate_limit import Limit, rate_limit
from app.db.session import get_db
from app.models.support.support_message import SupportMessage, SupportMessageStatus
from app.models.user import User
from app.schemas.support import SupportMessagePatchRequest

router = APIRouter(prefix="/api/admin/support", tags=["admin"])


@router.get("")
def list_support_messages(
    request: Request,
    status: str | None = None,
    q: str | None = None,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
) -> list[dict]:
    rate_limit(request=request, key="admin.support.list", limit=Limit(requests=120, window_seconds=60))

    query = db.query(SupportMessage).order_by(SupportMessage.created_at.desc())
    if status in {"open", "reviewed", "closed"}:
        query = query.filter(SupportMessage.status == SupportMessageStatus(status))
    if q:
        query = query.filter(SupportMessage.email.ilike(f"%{q.lower()}%"))
    rows = query.limit(500).all()
    return [
        {
            "id": str(r.id),
            "email": r.email,
            "subject": r.subject,
            "message": r.message,
            "status": r.status.value,
            "internal_note": r.internal_note,
            "created_at": r.created_at.isoformat(),
        }
        for r in rows
    ]


@router.patch("/{message_id}")
def patch_support_message(
    message_id: str,
    payload: SupportMessagePatchRequest,
    request: Request,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
) -> dict:
    rate_limit(request=request, key="admin.support.patch", limit=Limit(requests=120, window_seconds=60))

    msg = db.query(SupportMessage).filter(SupportMessage.id == message_id).one_or_none()
    if not msg:
        raise HTTPException(status_code=404, detail="Support message not found")

    if payload.status:
        if payload.status not in {"open", "reviewed", "closed"}:
            raise HTTPException(status_code=400, detail="Invalid status")
        msg.status = SupportMessageStatus(payload.status)

    if payload.internal_note is not None:
        msg.internal_note = payload.internal_note

    db.add(msg)
    db.commit()
    return {"ok": True}

