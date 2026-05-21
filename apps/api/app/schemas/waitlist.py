from __future__ import annotations

from pydantic import BaseModel, EmailStr, Field


class WaitlistCreateRequest(BaseModel):
    email: EmailStr
    role: str | None = Field(default=None, max_length=120)
    job_search_status: str | None = Field(default=None, max_length=120)
    source: str | None = Field(default=None, max_length=120)


class WaitlistEntryOut(BaseModel):
    id: str
    email: EmailStr
    role: str | None
    job_search_status: str | None
    source: str | None
    created_at: str

