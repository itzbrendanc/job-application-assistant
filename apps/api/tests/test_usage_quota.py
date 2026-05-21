from __future__ import annotations

from datetime import datetime, timezone
from uuid import uuid4

import pytest
from fastapi import HTTPException

from app.models.billing.subscription import Subscription
from app.services.billing.usage import FREE_APPLICATIONS_PER_MONTH, require_active_subscription_or_free_quota


class FakeDB:
    def __init__(self):
        self.events = []


def test_free_quota_blocks_when_exceeded(monkeypatch):
    user_id = uuid4()
    sub = Subscription(user_id=user_id, status="free")

    # Monkeypatch the free usage counter to simulate already at limit.
    from app.services import billing as _  # noqa: F401
    from app.services.billing import usage as usage_mod

    monkeypatch.setattr(usage_mod, "free_usage_used", lambda *_args, **_kwargs: FREE_APPLICATIONS_PER_MONTH)
    db = FakeDB()

    with pytest.raises(HTTPException) as e:
        require_active_subscription_or_free_quota(db, user_id=user_id, subscription=sub, event_type="application.record")
    assert e.value.status_code == 402


def test_pro_is_unlimited(monkeypatch):
    user_id = uuid4()
    sub = Subscription(user_id=user_id, status="active")

    from app.services.billing import usage as usage_mod
    monkeypatch.setattr(usage_mod, "free_usage_used", lambda *_args, **_kwargs: 9999)

    db = FakeDB()
    require_active_subscription_or_free_quota(db, user_id=user_id, subscription=sub, event_type="application.record")

