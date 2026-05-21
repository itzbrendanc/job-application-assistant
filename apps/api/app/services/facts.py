from __future__ import annotations

from uuid import UUID

from sqlalchemy.orm import Session

from app.models.profile_fact import ProfileFact


def load_approved_facts(db: Session, *, profile_id: UUID) -> dict:
    """Return only facts the user approved.

    Guardrail: downstream AI/services must use this instead of raw parsed data.
    """

    facts: dict[str, list] = {}
    rows = (
        db.query(ProfileFact)
        .filter(ProfileFact.profile_id == profile_id, ProfileFact.approval_status == "approved")
        .all()
    )
    for row in rows:
        facts.setdefault(row.fact_type, []).append({"key": row.fact_key, "value": row.fact_value})
    return facts

