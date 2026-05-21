from __future__ import annotations

from collections import defaultdict, deque
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone

from fastapi import HTTPException, Request


@dataclass
class Limit:
    requests: int
    window_seconds: int


_buckets: dict[str, deque[datetime]] = defaultdict(deque)


def _now() -> datetime:
    return datetime.now(timezone.utc)


def rate_limit(*, request: Request, key: str, limit: Limit) -> None:
    """In-memory rate limit (per-process).

    Production: replace with Redis-based limiter.
    """

    ident = request.client.host if request.client else "unknown"
    bucket_key = f"{key}:{ident}"
    q = _buckets[bucket_key]
    cutoff = _now() - timedelta(seconds=limit.window_seconds)
    while q and q[0] < cutoff:
        q.popleft()
    if len(q) >= limit.requests:
        raise HTTPException(status_code=429, detail="Rate limit exceeded")
    q.append(_now())

