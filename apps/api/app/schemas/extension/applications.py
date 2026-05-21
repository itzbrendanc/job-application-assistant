from __future__ import annotations

from pydantic import BaseModel, Field


class DraftApplicationRequest(BaseModel):
    job_id: str | None = None
    job_url: str
    company: str | None = None
    job_title: str | None = None
    location: str | None = None
    source_website: str = "other"
    resume_version: str | None = None
    cover_letter_version: str | None = None


class DraftApplicationResponse(BaseModel):
    application_id: str
    status: str


class RecordApplicationRequest(BaseModel):
    application_id: str
    status: str = "in_progress"
    submitted_by_extension: bool = False
    notes: str | None = None
    follow_up_date: str | None = None
    recruiter_contact: str | None = None
    review_packet: dict = Field(default_factory=dict)

