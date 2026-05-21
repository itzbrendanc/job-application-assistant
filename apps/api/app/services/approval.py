from __future__ import annotations

from dataclasses import dataclass


SENSITIVE_KEYWORDS = (
    "race",
    "ethnicity",
    "gender",
    "disability",
    "veteran",
    "salary",
    "compensation",
    "work authorization",
    "visa",
    "sponsorship",
)


@dataclass(frozen=True)
class ApprovalDecision:
    needs_user_approval: bool
    reason: str | None


def determine_if_sensitive(question_text: str) -> ApprovalDecision:
    lowered = question_text.lower()
    for kw in SENSITIVE_KEYWORDS:
        if kw in lowered:
            return ApprovalDecision(True, f"Sensitive keyword detected: {kw}")
    return ApprovalDecision(False, None)

