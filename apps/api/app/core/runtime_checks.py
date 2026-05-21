from __future__ import annotations

import sys


def assert_supported_python() -> None:
    # As of 2026-05, several upstream native deps (notably pydantic-core toolchain)
    # may not build cleanly on Python 3.14 everywhere.
    major, minor = sys.version_info[:2]
    if (major, minor) >= (3, 14):
        raise RuntimeError(
            "Python 3.14+ detected. This starter targets Python 3.13.x for now "
            "because some native dependencies may fail to build on 3.14. "
            "Please use Python 3.13 (pyenv/conda) or update dependency pins once upstream wheels are available."
        )

