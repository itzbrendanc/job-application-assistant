from __future__ import annotations

from pydantic import BaseModel


class AdminAnalyticsSummary(BaseModel):
    total_signups: int
    checkout_started: int
    subscription_active: int
    extension_opened: int
    extension_logged_in: int
    job_detected: int
    autofill_started: int
    autofill_completed: int
    autofill_failed: int
    autofill_success_rate: float
    autofill_failure_rate: float
    application_recorded: int
    applications_recorded_by_day: list[dict]
    excel_exported: int
    paywall_hit: int
    feedback_count: int
    signup_to_extension_conversion: float
    extension_to_first_application_conversion: float
    recent_events: list[dict]


class AdminAnalyticsEvent(BaseModel):
    id: str
    user_id: str | None
    anonymous_id: str | None
    event_name: str
    properties: dict
    source: str
    created_at: str
