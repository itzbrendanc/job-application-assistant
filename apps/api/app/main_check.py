from __future__ import annotations

from app.core.runtime_checks import assert_supported_python

assert_supported_python()

from app.main import app  # noqa: E402

