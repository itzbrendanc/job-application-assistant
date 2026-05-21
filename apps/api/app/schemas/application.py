from __future__ import annotations

from pydantic import BaseModel, Field


class ApplicationCreate(BaseModel):
    job_id: str
    source_mode: str = "manual_export"
    application_source: str = "other"
    resume_version: str | None = None
    cover_letter_version: str | None = None


class ApplicationOut(BaseModel):
    id: str
    user_id: str
    job_id: str
    status: str
    source_mode: str
    application_source: str
    resume_version: str | None = None
    cover_letter_version: str | None = None
    follow_up_date: str | None = None
    recruiter_contact: str | None = None
    notes: str | None = None
    submitted_by_extension: bool = False


class ApplicationUpdate(BaseModel):
    status: str | None = None
    application_source: str | None = None
    resume_version: str | None = None
    cover_letter_version: str | None = None
    follow_up_date: str | None = None  # ISO
    recruiter_contact: str | None = None
    notes: str | None = None


class AnswerUpsert(BaseModel):
    question_key: str
    question_text: str
    answer_text: str | None = None
    is_sensitive: bool = False
    needs_user_approval: bool = False
    approval_status: str = Field(default="pending")


class SubmitRequest(BaseModel):
    """Submission is a user-confirmed action only.

    This endpoint intentionally does NOT integrate with external sites.
    It records user confirmation + the review packet for auditing/tracking.
    """

    user_confirmed: bool = False
