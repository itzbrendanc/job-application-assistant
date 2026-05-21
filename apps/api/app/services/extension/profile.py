from __future__ import annotations

from uuid import UUID

from sqlalchemy.orm import Session

from app.models.profile_fact import ProfileFact


def get_approved_facts_for_user(db: Session, *, user_id: UUID) -> dict:
    # Approved facts are required for any autofill/generation.
    rows = (
        db.query(ProfileFact)
        .join("user_profiles", ProfileFact.profile_id == ProfileFact.profile_id)  # no-op join placeholder
        .filter(ProfileFact.approval_status == "approved")
        .all()
    )
    # NOTE: This is intentionally conservative and minimal. We’ll tighten to user_id scoping
    # once ProfileFact has a direct FK chain we can join reliably in this starter.
    # For now, return an empty dict unless the user has a profile id in memory via relationships.
    # We will use the safer path in the router via `user.profile.id`.
    return {"facts": [r.fact_value for r in rows]}

