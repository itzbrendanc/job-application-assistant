from __future__ import annotations

from datetime import date
from pydantic import BaseModel, HttpUrl


class ProfileUpdate(BaseModel):
    full_name: str | None = None
    headline: str | None = None
    summary: str | None = None
    location_text: str | None = None
    remote_preference: str | None = None
    salary_min: int | None = None
    salary_max: int | None = None
    salary_currency: str | None = None
    visa_status: str | None = None
    work_authorization: str | None = None
    availability_date: date | None = None
    linkedin_url: HttpUrl | None = None
    portfolio_url: HttpUrl | None = None


class ProfileOut(ProfileUpdate):
    id: str
    user_id: str

