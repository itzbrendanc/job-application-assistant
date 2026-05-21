from __future__ import annotations

from datetime import datetime
from uuid import UUID, uuid4

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import JSONB, UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Job(Base):
    __tablename__ = "jobs"
    __table_args__ = (UniqueConstraint("job_source_id", "external_job_id", name="uq_job_source_external"),)

    id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    job_source_id: Mapped[UUID | None] = mapped_column(PGUUID(as_uuid=True), ForeignKey("job_sources.id"), nullable=True)
    external_job_id: Mapped[str | None] = mapped_column(String, nullable=True)
    source_url: Mapped[str | None] = mapped_column(String, nullable=True)

    company_name: Mapped[str] = mapped_column(String, nullable=False)
    title: Mapped[str] = mapped_column(String, nullable=False)
    location_text: Mapped[str | None] = mapped_column(String, nullable=True)
    remote_type: Mapped[str] = mapped_column(String(20), default="unknown", nullable=False)

    salary_min: Mapped[int | None] = mapped_column(Integer, nullable=True)
    salary_max: Mapped[int | None] = mapped_column(Integer, nullable=True)
    salary_currency: Mapped[str | None] = mapped_column(String(10), nullable=True)

    description_raw: Mapped[str] = mapped_column(Text, nullable=False)
    description_normalized: Mapped[dict] = mapped_column(JSONB, default=dict, nullable=False)
    requirements: Mapped[dict] = mapped_column(JSONB, default=dict, nullable=False)

    imported_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

