from __future__ import annotations

import secrets

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.api.admin_deps import require_admin
from app.core.rate_limit import Limit, rate_limit
from app.db.session import get_db
from app.models.beta.beta_invite import BetaInvite, BetaInviteStatus
from app.models.user import User
from app.schemas.beta_invites import BetaInviteCreateRequest

router = APIRouter(prefix="/api/admin/beta-invites", tags=["admin"])


def _make_code() -> str:
    # Human-copyable enough, still unguessable for beta.
    return secrets.token_hex(12)


@router.post("")
def create_invite(
    payload: BetaInviteCreateRequest,
    request: Request,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
) -> dict:
    rate_limit(request=request, key="admin.beta_invites.create", limit=Limit(requests=60, window_seconds=60))

    email = payload.email.strip().lower()
    existing = db.query(BetaInvite).filter(BetaInvite.email == email).one_or_none()
    if existing and existing.status == BetaInviteStatus.accepted:
        raise HTTPException(status_code=400, detail="Invite already accepted for this email")

    if existing:
        if existing.status == BetaInviteStatus.revoked:
            existing.invite_code = _make_code()
        existing.status = BetaInviteStatus.pending
        existing.invited_by_user_id = admin_user.id
        existing.accepted_by_user_id = None
        existing.accepted_at = None
        db.add(existing)
        db.commit()
        db.refresh(existing)
        return {
            "id": str(existing.id),
            "email": existing.email,
            "invite_code": existing.invite_code,
            "status": existing.status.value,
            "created_at": existing.created_at.isoformat(),
            "accepted_at": existing.accepted_at.isoformat() if existing.accepted_at else None,
        }

    invite = BetaInvite(
        email=email,
        invite_code=_make_code(),
        status=BetaInviteStatus.pending,
        invited_by_user_id=admin_user.id,
        accepted_by_user_id=None,
        accepted_at=None,
    )
    db.add(invite)
    db.commit()
    db.refresh(invite)
    return {
        "id": str(invite.id),
        "email": invite.email,
        "invite_code": invite.invite_code,
        "status": invite.status.value,
        "created_at": invite.created_at.isoformat(),
        "accepted_at": invite.accepted_at.isoformat() if invite.accepted_at else None,
    }


@router.get("")
def list_invites(
    request: Request,
    status: str | None = None,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
) -> list[dict]:
    rate_limit(request=request, key="admin.beta_invites.list", limit=Limit(requests=120, window_seconds=60))

    q = db.query(BetaInvite).order_by(BetaInvite.created_at.desc())
    if status in {"pending", "accepted", "revoked"}:
        q = q.filter(BetaInvite.status == BetaInviteStatus(status))
    rows = q.limit(200).all()
    return [
        {
            "id": str(r.id),
            "email": r.email,
            "invite_code": r.invite_code,
            "status": r.status.value,
            "invited_by_user_id": str(r.invited_by_user_id) if r.invited_by_user_id else None,
            "accepted_by_user_id": str(r.accepted_by_user_id) if r.accepted_by_user_id else None,
            "created_at": r.created_at.isoformat(),
            "accepted_at": r.accepted_at.isoformat() if r.accepted_at else None,
        }
        for r in rows
    ]


@router.patch("/{invite_id}/revoke")
def revoke_invite(
    invite_id: str,
    request: Request,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
) -> dict:
    rate_limit(request=request, key="admin.beta_invites.revoke", limit=Limit(requests=120, window_seconds=60))

    invite = db.query(BetaInvite).filter(BetaInvite.id == invite_id).one_or_none()
    if not invite:
        raise HTTPException(status_code=404, detail="Invite not found")
    if invite.status == BetaInviteStatus.accepted:
        raise HTTPException(status_code=400, detail="Cannot revoke an accepted invite")
    invite.status = BetaInviteStatus.revoked
    db.add(invite)
    db.commit()
    return {"ok": True}

