from __future__ import annotations

from datetime import datetime, timezone
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.application import Application, ApplicationAnswer, ApplicationEvent
from app.services.audit import log_event


def create_application(
    db: Session,
    *,
    user_id: UUID,
    job_id: UUID,
    source_mode: str,
    application_source: str,
    resume_version: str | None,
    cover_letter_version: str | None,
) -> Application:
    row = Application(
        user_id=user_id,
        job_id=job_id,
        source_mode=source_mode,
        application_source=application_source,
        resume_version=resume_version,
        cover_letter_version=cover_letter_version,
        status="draft",
        review_packet={},
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    log_event(
        db,
        user_id=user_id,
        application_id=row.id,
        actor_type="system",
        event_type="application.created",
        event_payload={"job_id": str(job_id), "source_mode": source_mode, "application_source": application_source},
    )
    return row


def upsert_answer(db: Session, *, user_id: UUID, application_id: UUID, payload: dict) -> ApplicationAnswer:
    row = db.query(ApplicationAnswer).filter(ApplicationAnswer.application_id == application_id, ApplicationAnswer.question_key == payload["question_key"]).one_or_none()
    if row:
        for k, v in payload.items():
            setattr(row, k, v)
        db.commit()
        db.refresh(row)
    else:
        row = ApplicationAnswer(application_id=application_id, **payload)
        db.add(row)
        db.commit()
        db.refresh(row)
    log_event(
        db,
        user_id=user_id,
        application_id=application_id,
        actor_type="system",
        event_type="application.answer_upserted",
        event_payload={"question_key": payload["question_key"], "needs_user_approval": payload.get("needs_user_approval")},
    )
    return row


def finalize_review_packet(db: Session, *, user_id: UUID, application: Application) -> Application:
    answers = (
        db.query(ApplicationAnswer)
        .filter(ApplicationAnswer.application_id == application.id)
        .all()
    )
    application.review_packet = {
        "job_id": str(application.job_id),
        "answers": [
            {
                "question_key": a.question_key,
                "question_text": a.question_text,
                "answer_text": a.answer_text,
                "is_sensitive": a.is_sensitive,
                "needs_user_approval": a.needs_user_approval,
                "approval_status": a.approval_status,
            }
            for a in answers
        ],
    }
    application.status = "ready_for_review"
    db.commit()
    db.refresh(application)
    log_event(
        db,
        user_id=user_id,
        application_id=application.id,
        actor_type="system",
        event_type="application.ready_for_review",
        event_payload={},
    )
    return application


def submit_application(db: Session, *, user_id: UUID, application: Application, user_confirmed: bool) -> Application:
    # Hard constraint: never auto-submit. Require explicit user confirmation.
    if not user_confirmed:
        raise HTTPException(status_code=400, detail="Explicit user confirmation required to submit.")

    # Guardrail: any sensitive answers must be approved before marking submitted.
    pending_sensitive = (
        db.query(ApplicationAnswer)
        .filter(
            ApplicationAnswer.application_id == application.id,
            ApplicationAnswer.needs_user_approval.is_(True),
            ApplicationAnswer.approval_status != "approved",
        )
        .count()
    )
    if pending_sensitive:
        raise HTTPException(status_code=400, detail="Sensitive answers require explicit approval before submission.")

    application.status = "submitted"
    application.submitted_at = datetime.now(timezone.utc)
    db.add(ApplicationEvent(application_id=application.id, event_type="application.submitted", event_payload={}))
    db.commit()
    db.refresh(application)
    log_event(
        db,
        user_id=user_id,
        application_id=application.id,
        actor_type="user",
        event_type="application.submitted",
        event_payload={"note": "This records user intent; no external site submission is performed."},
    )
    return application
