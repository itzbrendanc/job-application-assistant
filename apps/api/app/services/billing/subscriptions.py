from __future__ import annotations

from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy.orm import Session

from app.models.billing.customer import BillingCustomer
from app.models.billing.subscription import Subscription


def get_or_create_subscription_row(db: Session, *, user_id: UUID) -> Subscription:
    row = db.query(Subscription).filter(Subscription.user_id == user_id).one_or_none()
    if row:
        return row
    row = Subscription(user_id=user_id, status="free")
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


def upsert_billing_customer(db: Session, *, user_id: UUID, stripe_customer_id: str) -> BillingCustomer:
    row = db.query(BillingCustomer).filter(BillingCustomer.user_id == user_id).one_or_none()
    if row:
        row.stripe_customer_id = stripe_customer_id
        db.commit()
        db.refresh(row)
        return row
    row = BillingCustomer(user_id=user_id, stripe_customer_id=stripe_customer_id)
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


def apply_stripe_subscription(
    db: Session,
    *,
    user_id: UUID,
    stripe_subscription_id: str,
    stripe_price_id: str | None,
    status: str,
    current_period_start: int | None,
    current_period_end: int | None,
    cancel_at_period_end: bool,
) -> Subscription:
    row = get_or_create_subscription_row(db, user_id=user_id)
    row.stripe_subscription_id = stripe_subscription_id
    row.stripe_price_id = stripe_price_id
    row.status = status
    row.cancel_at_period_end = cancel_at_period_end
    row.current_period_start = (
        datetime.fromtimestamp(current_period_start, tz=timezone.utc) if current_period_start else None
    )
    row.current_period_end = datetime.fromtimestamp(current_period_end, tz=timezone.utc) if current_period_end else None
    db.commit()
    db.refresh(row)
    return row

