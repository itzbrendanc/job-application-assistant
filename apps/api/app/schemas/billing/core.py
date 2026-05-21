from __future__ import annotations

from pydantic import BaseModel


class CheckoutRequest(BaseModel):
    plan: str  # "pro_monthly" | "pro_annual"
    success_url: str | None = None
    cancel_url: str | None = None


class PortalRequest(BaseModel):
    return_url: str


class BillingStatus(BaseModel):
    plan: str  # free/pro
    subscription_status: str
    is_pro: bool
    free_quota_limit: int
    free_quota_used: int
    free_quota_remaining: int
