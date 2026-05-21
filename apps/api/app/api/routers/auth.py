from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.security import create_access_token, hash_password, verify_password
from app.db.session import get_db
from app.models.user import User
from app.models.user_profile import UserProfile
from app.models.beta.beta_invite import BetaInvite, BetaInviteStatus
from app.schemas.auth import LoginRequest, SignupRequest, TokenResponse
from app.services.audit import log_event
from app.core.rate_limit import Limit, rate_limit
from app.core.config import settings
from datetime import datetime, timezone

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/signup", response_model=TokenResponse)
def signup(payload: SignupRequest, request: Request, db: Session = Depends(get_db)) -> TokenResponse:
    rate_limit(request=request, key="auth.signup", limit=Limit(requests=10, window_seconds=60))
    existing = db.query(User).filter(User.email == payload.email).one_or_none()
    if existing:
        raise HTTPException(status_code=400, detail="Email already in use")

    invite: BetaInvite | None = None
    if settings.beta_invite_only:
        invite_code = (payload.invite_code or "").strip()
        if not invite_code:
            raise HTTPException(status_code=403, detail="Invite code required for beta access")
        invite = (
            db.query(BetaInvite)
            .filter(BetaInvite.email == payload.email, BetaInvite.invite_code == invite_code)
            .one_or_none()
        )
        if not invite or invite.status != BetaInviteStatus.pending:
            raise HTTPException(status_code=403, detail="Invalid or revoked invite code")

    user = User(email=payload.email, password_hash=hash_password(payload.password), auth_provider="password")
    db.add(user)
    db.commit()
    db.refresh(user)

    profile = UserProfile(user_id=user.id)
    db.add(profile)
    db.commit()

    if invite:
        invite.status = BetaInviteStatus.accepted
        invite.accepted_by_user_id = user.id
        invite.accepted_at = datetime.now(timezone.utc)
        db.add(invite)
        db.commit()

    log_event(db, user_id=user.id, application_id=None, actor_type="user", event_type="auth.signup", event_payload={})
    return TokenResponse(access_token=create_access_token(subject=str(user.id)))


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, request: Request, db: Session = Depends(get_db)) -> TokenResponse:
    rate_limit(request=request, key="auth.login", limit=Limit(requests=20, window_seconds=60))
    user = db.query(User).filter(User.email == payload.email).one_or_none()
    if not user or not user.password_hash:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    log_event(db, user_id=user.id, application_id=None, actor_type="user", event_type="auth.login", event_payload={})
    return TokenResponse(access_token=create_access_token(subject=str(user.id)))


@router.get("/me")
def me(user: User = Depends(get_current_user)) -> dict:
    return {"id": str(user.id), "email": user.email}
