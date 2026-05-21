from __future__ import annotations

from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

from app.api.admin_deps import require_admin
from app.core.rate_limit import Limit, rate_limit
from app.db.session import get_db
from app.models.beta.waitlist_entry import WaitlistEntry
from app.models.user import User

router = APIRouter(prefix="/api/admin/waitlist", tags=["admin"])


@router.get("")
def list_waitlist(
    request: Request,
    q: str | None = None,
    source: str | None = None,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
) -> list[dict]:
    rate_limit(request=request, key="admin.waitlist.list", limit=Limit(requests=120, window_seconds=60))

    query = db.query(WaitlistEntry).order_by(WaitlistEntry.created_at.desc())
    if source:
        query = query.filter(WaitlistEntry.source == source)
    if q:
        query = query.filter(WaitlistEntry.email.ilike(f"%{q.lower()}%"))

    rows = query.limit(500).all()
    return [
        {
            "id": str(r.id),
            "email": r.email,
            "role": r.role,
            "job_search_status": r.job_search_status,
            "source": r.source,
            "created_at": r.created_at.isoformat(),
        }
        for r in rows
    ]

