from __future__ import annotations

from pydantic import BaseModel, Field


ALLOWED_EVENTS = {
    "signup_started",
    "signup_completed",
    "resume_uploaded",
    "extension_opened",
    "extension_logged_in",
    "job_detected",
    "autofill_started",
    "autofill_completed",
    "autofill_failed",
    "application_recorded",
    "excel_exported",
    "checkout_started",
    "subscription_active",
    "paywall_hit",
}


class AnalyticsIn(BaseModel):
    event_name: str = Field(min_length=2, max_length=80)
    anonymous_id: str | None = Field(default=None, max_length=80)
    properties: dict = Field(default_factory=dict)
    source: str = Field(default="web", max_length=20)

    def validate_event_name(self) -> None:
        if self.event_name not in ALLOWED_EVENTS:
            raise ValueError("Invalid event name")


class AnalyticsOut(BaseModel):
    ok: bool = True
