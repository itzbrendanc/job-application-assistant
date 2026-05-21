from __future__ import annotations

from pydantic import BaseModel, HttpUrl


class JobCreate(BaseModel):
    job_source: str | None = None
    external_job_id: str | None = None
    source_url: HttpUrl | None = None
    company_name: str
    title: str
    location_text: str | None = None
    remote_type: str = "unknown"
    salary_min: int | None = None
    salary_max: int | None = None
    salary_currency: str | None = None
    description_raw: str


class JobOut(JobCreate):
    id: str


class JobFitOut(BaseModel):
    job_id: str
    user_id: str
    score: float
    match_reasons: list[str]
    mismatch_reasons: list[str]
    uncertainties: list[str]

