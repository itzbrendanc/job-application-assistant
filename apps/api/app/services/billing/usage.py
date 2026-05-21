from __future__ import annotations

from datetime import datetime, timezone
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.billing.subscription import Subscription
from app.models.billing.usage import UsageEvent
from app.services.audit import log_event
from app.services.telemetry.store import store_analytics_event


FREE_APPLICATIONS_PER_MONTH = 10


def month_start(dt: datetime) -> datetime:
    return datetime(dt.year, dt.month, 1, tzinfo=timezone.utc)


def is_pro_active(sub: Subscription | None) -> bool:
    if not sub:
        return False
    return sub.status in ("active", "trialing")


def free_usage_used(db: Session, *, user_id: UUID, event_type: str, now: datetime | None = None) -> int:
    now = now or datetime.now(timezone.utc)
    start = month_start(now)
    total = (
        db.query(func.coalesce(func.sum(UsageEvent.quantity), 0))
        .filter(UsageEvent.user_id == user_id, UsageEvent.event_type == event_type, UsageEvent.occurred_at >= start)
        .scalar()
    )
    return int(total or 0)


def require_active_subscription_or_free_quota(
    db: Session,
    *,
    user_id: UUID,
    subscription: Subscription | None,
    event_type: str,
    quantity: int = 1,
) -> None:
    if is_pro_active(subscription):
        return

    used = free_usage_used(db, user_id=user_id, event_type=event_type)
    if used + quantity > FREE_APPLICATIONS_PER_MONTH:
        log_event(
            db,
            user_id=user_id,
            application_id=None,
            actor_type="system",
            event_type="paywall.blocked",
            event_payload={"event_type": event_type, "used": used, "limit": FREE_APPLICATIONS_PER_MONTH},
        )
        # Analytics-compatible event (separate from audit logs).
        store_analytics_event(
            db,
            user_id=user_id,
            anonymous_id=None,
            event_name="paywall_hit",
            properties={"event_type": event_type, "used": used, "limit": FREE_APPLICATIONS_PER_MONTH},
            source="backend",
        )
        raise HTTPException(
            status_code=402,
            detail={
                "code": "upgrade_required",
                "message": f"Free plan limit reached ({FREE_APPLICATIONS_PER_MONTH}/month). Upgrade to Pro to continue.",
                "used": used,
                "limit": FREE_APPLICATIONS_PER_MONTH,
            },
        )


def record_usage(db: Session, *, user_id: UUID, event_type: str, quantity: int = 1, metadata: dict | None = None) -> None:
    db.add(UsageEvent(user_id=user_id, event_type=event_type, quantity=quantity, metadata=metadata or {}))
    db.commit()
