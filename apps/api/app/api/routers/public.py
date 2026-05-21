from __future__ import annotations

from fastapi import APIRouter

from app.core.config import settings

router = APIRouter(prefix="/api/public", tags=["public"])


@router.get("/config")
def public_config() -> dict:
    # Public, non-sensitive config for client UX.
    return {"beta_invite_only": bool(settings.beta_invite_only), "app_origin": settings.app_origin}
