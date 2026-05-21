from __future__ import annotations

from uuid import UUID

from sqlalchemy.orm import Session

from app.models.cover_letter import CoverLetter
from app.models.billing.subscription import Subscription
from app.services.ai.base import ApprovedFacts
from app.services.ai.stub import StubCoverLetterGenerator
from app.services.billing.subscriptions import get_or_create_subscription_row
from app.services.billing.usage import record_usage, require_active_subscription_or_free_quota


def generate_cover_letter(db: Session, *, user_id: UUID, job_id: UUID | None, job_description: str, approved_facts: dict) -> CoverLetter:
    sub: Subscription = get_or_create_subscription_row(db, user_id=user_id)
    require_active_subscription_or_free_quota(db, user_id=user_id, subscription=sub, event_type="cover_letter.generate")

    generator = StubCoverLetterGenerator()
    body = generator.generate(job_description=job_description, approved_facts=ApprovedFacts(approved_facts))
    row = CoverLetter(user_id=user_id, job_id=job_id, body_markdown=body, source_fact_snapshot=approved_facts)
    db.add(row)
    db.commit()
    db.refresh(row)
    record_usage(db, user_id=user_id, event_type="cover_letter.generate", metadata={"job_id": str(job_id) if job_id else None})
    return row
