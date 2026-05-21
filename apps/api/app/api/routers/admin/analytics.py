from __future__ import annotations

from fastapi import APIRouter, Depends
from datetime import datetime, timedelta, timezone
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.api.admin_deps import require_admin
from app.db.session import get_db
from app.models.telemetry.analytics_event import AnalyticsEvent
from app.models.telemetry.feedback_message import FeedbackMessage
from app.schemas.admin.analytics import AdminAnalyticsEvent, AdminAnalyticsSummary

router = APIRouter(prefix="/api/admin/analytics", tags=["admin"])


@router.get("/summary", response_model=AdminAnalyticsSummary)
def summary(db: Session = Depends(get_db), _admin=Depends(require_admin)) -> AdminAnalyticsSummary:
    def count(name: str) -> int:
        return int(db.query(func.count(AnalyticsEvent.id)).filter(AnalyticsEvent.event_name == name).scalar() or 0)

    started = count("autofill_started")
    failed = count("autofill_failed")
    completed = count("autofill_completed")

    # Beta-friendly: derive daily counts for last 7 days.
    now = datetime.now(timezone.utc)
    start = now - timedelta(days=6)
    rows = (
        db.query(AnalyticsEvent.created_at, AnalyticsEvent.event_name)
        .filter(AnalyticsEvent.event_name == "application_recorded", AnalyticsEvent.created_at >= start)
        .order_by(AnalyticsEvent.created_at.asc())
        .all()
    )
    by_day: dict[str, int] = {}
    for created_at, _ in rows:
        key = created_at.date().isoformat()
        by_day[key] = by_day.get(key, 0) + 1
    applications_by_day = [{"date": d, "count": by_day[d]} for d in sorted(by_day.keys())]

    signups = count("signup_completed")
    extension_opened = count("extension_opened")
    application_recorded = count("application_recorded")
    signup_to_extension = float(extension_opened / signups) if signups > 0 else 0.0
    extension_to_first_app = float(application_recorded / extension_opened) if extension_opened > 0 else 0.0

    recent = (
        db.query(AnalyticsEvent)
        .order_by(AnalyticsEvent.created_at.desc())
        .limit(25)
        .all()
    )
    feedback_count = int(db.query(func.count(FeedbackMessage.id)).scalar() or 0)

    return AdminAnalyticsSummary(
        total_signups=signups,
        checkout_started=count("checkout_started"),
        subscription_active=count("subscription_active"),
        extension_opened=extension_opened,
        extension_logged_in=count("extension_logged_in"),
        job_detected=count("job_detected"),
        autofill_started=started,
        autofill_completed=completed,
        autofill_failed=failed,
        autofill_success_rate=float(completed / started) if started > 0 else 0.0,
        autofill_failure_rate=float(failed / started) if started > 0 else 0.0,
        application_recorded=application_recorded,
        applications_recorded_by_day=applications_by_day,
        excel_exported=count("excel_exported"),
        paywall_hit=count("paywall_hit"),
        feedback_count=feedback_count,
        signup_to_extension_conversion=signup_to_extension,
        extension_to_first_application_conversion=extension_to_first_app,
        recent_events=[
            {
                "id": str(e.id),
                "event_name": e.event_name,
                "source": e.source,
                "created_at": e.created_at.isoformat(),
                "user_id": str(e.user_id) if e.user_id else None,
                "anonymous_id": e.anonymous_id,
                "properties": e.properties or {},
            }
            for e in recent
        ],
    )


@router.get("/events", response_model=list[AdminAnalyticsEvent])
def events(
    db: Session = Depends(get_db),
    _admin=Depends(require_admin),
    event_name: str | None = None,
    source: str | None = None,
    limit: int = 100,
) -> list[AdminAnalyticsEvent]:
    q = db.query(AnalyticsEvent).order_by(AnalyticsEvent.created_at.desc())
    if event_name:
        q = q.filter(AnalyticsEvent.event_name == event_name)
    if source:
        q = q.filter(AnalyticsEvent.source == source)
    rows = q.limit(min(500, max(1, limit))).all()
    return [
        AdminAnalyticsEvent(
            id=str(r.id),
            user_id=str(r.user_id) if r.user_id else None,
            anonymous_id=r.anonymous_id,
            event_name=r.event_name,
            properties=r.properties or {},
            source=r.source,
            created_at=r.created_at.isoformat(),
        )
        for r in rows
    ]
