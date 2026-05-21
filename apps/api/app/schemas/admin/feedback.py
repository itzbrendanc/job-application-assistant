from __future__ import annotations

from pydantic import BaseModel, Field


class AdminFeedbackOut(BaseModel):
    id: str
    email: str | None
    category: str
    message: str
    rating: int | None
    source_page: str | None
    reviewed: bool
    internal_note: str | None
    created_at: str


class AdminFeedbackUpdate(BaseModel):
    reviewed: bool | None = None
    internal_note: str | None = Field(default=None, max_length=10_000)

