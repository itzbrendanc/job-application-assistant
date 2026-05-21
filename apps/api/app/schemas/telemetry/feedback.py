from __future__ import annotations

from pydantic import BaseModel, Field


class FeedbackIn(BaseModel):
    email: str | None = Field(default=None, max_length=320)
    category: str = Field(default="general", max_length=60)
    message: str = Field(min_length=2, max_length=10_000)
    rating: int | None = Field(default=None, ge=1, le=5)
    source_page: str | None = Field(default=None, max_length=200)


class FeedbackOut(BaseModel):
    ok: bool = True

