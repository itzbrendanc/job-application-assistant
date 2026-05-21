from __future__ import annotations

from pydantic import BaseModel, EmailStr, Field


class SupportCreateRequest(BaseModel):
    email: EmailStr
    subject: str = Field(min_length=3, max_length=200)
    message: str = Field(min_length=5, max_length=8000)


class SupportMessageOut(BaseModel):
    id: str
    email: EmailStr
    subject: str
    message: str
    status: str
    internal_note: str | None
    created_at: str


class SupportMessagePatchRequest(BaseModel):
    status: str | None = Field(default=None)
    internal_note: str | None = Field(default=None, max_length=5000)

