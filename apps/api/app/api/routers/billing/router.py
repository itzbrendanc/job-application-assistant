from __future__ import annotations

import json
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
import stripe

from app.api.deps import get_current_user
from app.core.config import settings
from app.db.session import get_db
from app.models.billing.customer import BillingCustomer
from app.models.billing.subscription import Subscription
from app.models.user import User
from app.schemas.billing.core import BillingStatus, CheckoutRequest, PortalRequest
from app.services.audit import log_event
from app.services.billing.stripe_client import init_stripe, stripe_enabled
from app.services.billing.subscriptions import apply_stripe_subscription, get_or_create_subscription_row, upsert_billing_customer
from app.services.billing.usage import FREE_APPLICATIONS_PER_MONTH, free_usage_used, is_pro_active
from app.core.rate_limit import Limit, rate_limit
from app.services.telemetry.store import store_analytics_event

router = APIRouter(prefix="/api/billing", tags=["billing"])


def _require_stripe():
    if not stripe_enabled():
        raise HTTPException(status_code=500, detail="Stripe is not configured.")
    init_stripe()


@router.post("/checkout")
def checkout(payload: CheckoutRequest, request: Request, db: Session = Depends(get_db), user: User = Depends(get_current_user)) -> dict:
    rate_limit(request=request, key="billing.checkout", limit=Limit(requests=10, window_seconds=60))
    _require_stripe()

    price_id = None
    if payload.plan == "pro_monthly":
        price_id = getattr(settings, "stripe_price_pro_monthly", None)
    elif payload.plan == "pro_annual":
        price_id = getattr(settings, "stripe_price_pro_annual", None)
    else:
        raise HTTPException(status_code=400, detail="Unknown plan")
    if not price_id:
        raise HTTPException(status_code=500, detail="Stripe price id not configured")

    customer = db.query(BillingCustomer).filter(BillingCustomer.user_id == user.id).one_or_none()
    if customer:
        stripe_customer_id = customer.stripe_customer_id
    else:
        c = stripe.Customer.create(email=user.email, metadata={"user_id": str(user.id)})
        stripe_customer_id = c["id"]
        upsert_billing_customer(db, user_id=user.id, stripe_customer_id=stripe_customer_id)

    session = stripe.checkout.Session.create(
        mode="subscription",
        customer=stripe_customer_id,
        line_items=[{"price": price_id, "quantity": 1}],
        success_url=payload.success_url or (settings.stripe_success_url or f"{settings.app_origin}/account/billing"),
        cancel_url=payload.cancel_url or (settings.stripe_cancel_url or f"{settings.app_origin}/pricing"),
        allow_promotion_codes=True,
        subscription_data={"metadata": {"user_id": str(user.id)}},
        metadata={"user_id": str(user.id)},
    )

    log_event(db, user_id=user.id, application_id=None, actor_type="user", event_type="billing.checkout_created", event_payload={"plan": payload.plan})
    store_analytics_event(
        db,
        user_id=user.id,
        anonymous_id=None,
        event_name="checkout_started",
        properties={"plan": payload.plan},
        source="backend",
    )
    return {"url": session["url"], "id": session["id"]}


@router.post("/portal")
def portal(payload: PortalRequest, request: Request, db: Session = Depends(get_db), user: User = Depends(get_current_user)) -> dict:
    rate_limit(request=request, key="billing.portal", limit=Limit(requests=10, window_seconds=60))
    _require_stripe()
    customer = db.query(BillingCustomer).filter(BillingCustomer.user_id == user.id).one_or_none()
    if not customer:
        raise HTTPException(status_code=400, detail="No billing customer found.")
    sess = stripe.billing_portal.Session.create(customer=customer.stripe_customer_id, return_url=payload.return_url)
    log_event(db, user_id=user.id, application_id=None, actor_type="user", event_type="billing.portal_opened", event_payload={})
    return {"url": sess["url"]}


@router.get("/status", response_model=BillingStatus)
def status(db: Session = Depends(get_db), user: User = Depends(get_current_user)) -> BillingStatus:
    sub = get_or_create_subscription_row(db, user_id=user.id)
    used = free_usage_used(db, user_id=user.id, event_type="application.record")
    remaining = max(0, FREE_APPLICATIONS_PER_MONTH - used)
    plan = "pro" if is_pro_active(sub) else "free"
    return BillingStatus(
        plan=plan,
        subscription_status=sub.status,
        is_pro=is_pro_active(sub),
        free_quota_limit=FREE_APPLICATIONS_PER_MONTH,
        free_quota_used=used,
        free_quota_remaining=remaining,
    )


@router.post("/webhook")
async def webhook(req: Request, db: Session = Depends(get_db)) -> dict:
    rate_limit(request=req, key="billing.webhook", limit=Limit(requests=300, window_seconds=60))
    _require_stripe()

    payload = await req.body()
    sig = req.headers.get("stripe-signature")
    if not sig:
        raise HTTPException(status_code=400, detail="Missing stripe-signature header")

    try:
        event = stripe.Webhook.construct_event(payload=payload, sig_header=sig, secret=settings.stripe_webhook_secret)
    except Exception as e:  # noqa: BLE001
        raise HTTPException(status_code=400, detail="Invalid webhook signature") from e

    etype = event["type"]
    data = event["data"]["object"]

    # Subscription lifecycle
    if etype in ("customer.subscription.created", "customer.subscription.updated", "customer.subscription.deleted"):
        customer_id = data.get("customer")
        price_id = None
        try:
            items = data.get("items", {}).get("data", [])
            if items:
                price_id = items[0].get("price", {}).get("id")
        except Exception:
            price_id = None

        # Resolve user_id from metadata (preferred) or customer mapping
        user_id = data.get("metadata", {}).get("user_id")
        if not user_id and customer_id:
            bc = db.query(BillingCustomer).filter(BillingCustomer.stripe_customer_id == customer_id).one_or_none()
            user_id = str(bc.user_id) if bc else None
        if user_id:
            apply_stripe_subscription(
                db,
                user_id=user_id,
                stripe_subscription_id=data.get("id"),
                stripe_price_id=price_id,
                status=data.get("status") or "unknown",
                current_period_start=data.get("current_period_start"),
                current_period_end=data.get("current_period_end"),
                cancel_at_period_end=bool(data.get("cancel_at_period_end")),
            )
            log_event(
                db,
                user_id=user_id,
                application_id=None,
                actor_type="system",
                event_type="billing.subscription_changed",
                event_payload={"stripe_subscription_id": data.get("id"), "status": data.get("status")},
            )
            if data.get("status") in ("active", "trialing"):
                store_analytics_event(
                    db,
                    user_id=user_id,
                    anonymous_id=None,
                    event_name="subscription_active",
                    properties={"stripe_subscription_id": data.get("id"), "status": data.get("status")},
                    source="backend",
                )

    # Invoices
    if etype.startswith("invoice."):
        # We store minimal info; never store payment method details.
        customer_id = data.get("customer")
        bc = db.query(BillingCustomer).filter(BillingCustomer.stripe_customer_id == customer_id).one_or_none()
        if bc:
            from app.models.billing.invoice import Invoice

            inv = db.query(Invoice).filter(Invoice.stripe_invoice_id == data.get("id")).one_or_none()
            if not inv:
                inv = Invoice(user_id=bc.user_id, stripe_invoice_id=data.get("id"), raw={})
                db.add(inv)
            inv.status = data.get("status")
            inv.amount_due = data.get("amount_due")
            inv.currency = data.get("currency")
            inv.hosted_invoice_url = data.get("hosted_invoice_url")
            inv.raw = {"type": etype}
            db.commit()
            log_event(
                db,
                user_id=bc.user_id,
                application_id=None,
                actor_type="system",
                event_type="billing.invoice_event",
                event_payload={"stripe_invoice_id": data.get("id"), "type": etype},
            )

    return {"received": True, "type": etype}
