from __future__ import annotations

import stripe

from app.core.config import settings


def init_stripe() -> None:
    stripe.api_key = getattr(settings, "stripe_secret_key", None) or ""


def stripe_enabled() -> bool:
    key = getattr(settings, "stripe_secret_key", None)
    return bool(key)

