from __future__ import annotations

from pydantic import BaseModel, EmailStr, Field


class BetaInviteCreateRequest(BaseModel):
    email: EmailStr


class BetaInviteOut(BaseModel):
    id: str
    email: EmailStr
    invite_code: str
    status: str
    invited_by_user_id: str | None
    accepted_by_user_id: str | None
    created_at: str
    accepted_at: str | None


class BetaInviteRevokeResponse(BaseModel):
    ok: bool = True

