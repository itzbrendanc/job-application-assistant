from __future__ import annotations

from uuid import UUID

from sqlalchemy.orm import Session

from app.models.audit import AuditLog


def log_event(
    db: Session,
    *,
    user_id: UUID,
    application_id: UUID | None,
    actor_type: str,
    event_type: str,
    event_payload: dict,
) -> AuditLog:
    entry = AuditLog(
        user_id=user_id,
        application_id=application_id,
        actor_type=actor_type,
        event_type=event_type,
        event_payload=event_payload,
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry

