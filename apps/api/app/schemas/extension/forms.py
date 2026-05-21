from __future__ import annotations

from pydantic import BaseModel, Field


class DetectedField(BaseModel):
    field_id: str
    name: str | None = None
    label: str | None = None
    field_type: str = "unknown"
    required: bool = False
    autocomplete: str | None = None
    placeholder: str | None = None
    aria_label: str | None = None
    data_automation_id: str | None = None
    form: str | None = None


class FormDetectRequest(BaseModel):
    job_url: str
    job_title: str | None = None
    company: str | None = None
    location: str | None = None
    source_website: str = Field(default="other")
    fields: list[DetectedField] = Field(default_factory=list)


class MapFieldsRequest(BaseModel):
    fields: list[DetectedField]


class MappedField(BaseModel):
    field_id: str
    mapped_key: str | None = None
    confidence: float = 0.0
    is_sensitive: bool = False
    needs_user_approval: bool = False
    reason: str | None = None


class MapFieldsResponse(BaseModel):
    mapped: list[MappedField]


class SuggestAnswersRequest(BaseModel):
    job_url: str
    job_description: str | None = None
    mapped: list[MappedField]


class SuggestedAnswer(BaseModel):
    field_id: str
    value: str | None = None
    confidence: float = 0.0
    needs_user_approval: bool = False
    reason: str | None = None


class SuggestAnswersResponse(BaseModel):
    suggested: list[SuggestedAnswer]
    cover_letter_markdown: str | None = None
    resume_version: str | None = None
