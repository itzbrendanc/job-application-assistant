from __future__ import annotations

from uuid import UUID

from sqlalchemy.orm import Session

from app.models.telemetry.analytics_event import AnalyticsEvent
from app.models.telemetry.feedback_message import FeedbackMessage


def store_analytics_event(
    db: Session,
    *,
    user_id: UUID | None,
    anonymous_id: str | None,
    event_name: str,
    properties: dict,
    source: str,
) -> None:
    db.add(
        AnalyticsEvent(
            user_id=user_id,
            anonymous_id=anonymous_id,
            event_name=event_name,
            properties=properties,
            source=source,
        )
    )
    db.commit()


def store_feedback(
    db: Session,
    *,
    email: str | None,
    category: str,
    message: str,
    rating: int | None,
    source_page: str | None,
) -> None:
    db.add(
        FeedbackMessage(
            email=email,
            category=category,
            message=message,
            rating=rating,
            source_page=source_page,
        )
    )
    db.commit()

