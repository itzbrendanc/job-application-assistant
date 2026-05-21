from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.admin_deps import require_admin
from app.db.session import get_db
from app.models.telemetry.feedback_message import FeedbackMessage
from app.schemas.admin.feedback import AdminFeedbackOut, AdminFeedbackUpdate

router = APIRouter(prefix="/api/admin/feedback", tags=["admin"])


@router.get("", response_model=list[AdminFeedbackOut])
def list_feedback(
    db: Session = Depends(get_db),
    _admin=Depends(require_admin),
    category: str | None = None,
    rating: int | None = None,
    reviewed: bool | None = None,
    limit: int = 100,
) -> list[AdminFeedbackOut]:
    q = db.query(FeedbackMessage).order_by(FeedbackMessage.created_at.desc())
    if category:
        q = q.filter(FeedbackMessage.category == category)
    if rating is not None:
        q = q.filter(FeedbackMessage.rating == rating)
    if reviewed is not None:
        q = q.filter(FeedbackMessage.reviewed.is_(reviewed))
    rows = q.limit(min(500, max(1, limit))).all()
    return [
        AdminFeedbackOut(
            id=str(r.id),
            email=r.email,
            category=r.category,
            message=r.message,
            rating=r.rating,
            source_page=r.source_page,
            reviewed=bool(r.reviewed),
            internal_note=r.internal_note,
            created_at=r.created_at.isoformat(),
        )
        for r in rows
    ]


@router.patch("/{feedback_id}", response_model=AdminFeedbackOut)
def update_feedback(
    feedback_id: str,
    payload: AdminFeedbackUpdate,
    db: Session = Depends(get_db),
    _admin=Depends(require_admin),
) -> AdminFeedbackOut:
    row = db.query(FeedbackMessage).filter(FeedbackMessage.id == feedback_id).one_or_none()
    if not row:
        raise HTTPException(status_code=404, detail="Feedback not found")
    data = payload.model_dump(exclude_unset=True)
    for k, v in data.items():
        setattr(row, k, v)
    db.commit()
    db.refresh(row)
    return AdminFeedbackOut(
        id=str(row.id),
        email=row.email,
        category=row.category,
        message=row.message,
        rating=row.rating,
        source_page=row.source_page,
        reviewed=bool(row.reviewed),
        internal_note=row.internal_note,
        created_at=row.created_at.isoformat(),
    )

