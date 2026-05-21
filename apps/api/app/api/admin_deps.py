from __future__ import annotations

from fastapi import Depends, HTTPException

from app.api.deps import get_current_user
from app.core.config import settings
from app.models.user import User


def _admin_email_set() -> set[str]:
    raw = settings.admin_emails or ""
    emails = [e.strip().lower() for e in raw.split(",") if e.strip()]
    return set(emails)


def require_admin(user: User = Depends(get_current_user)) -> User:
    allowed = _admin_email_set()
    if not allowed or user.email.lower() not in allowed:
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

