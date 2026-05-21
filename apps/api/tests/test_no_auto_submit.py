from datetime import datetime
from uuid import uuid4

import pytest

from app.models.application import Application
from app.services.applications import submit_application


class DummyDB:
    def query(self, *_args, **_kwargs):
        raise RuntimeError("not used")


def test_submit_requires_explicit_confirmation() -> None:
    app = Application(
        id=uuid4(),
        user_id=uuid4(),
        job_id=uuid4(),
        status="ready_for_review",
        source_mode="manual_export",
        review_packet={},
        submitted_at=None,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    with pytest.raises(Exception):
        submit_application(DummyDB(), user_id=app.user_id, application=app, user_confirmed=False)

