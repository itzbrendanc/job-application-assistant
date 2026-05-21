from __future__ import annotations

from pydantic import BaseModel


class JobDetectResponse(BaseModel):
    ok: bool = True
    job_id: str | None = None

