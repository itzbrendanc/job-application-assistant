from __future__ import annotations

import enum


class ApprovalStatus(str, enum.Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"


class ApplicationStatus(str, enum.Enum):
    draft = "draft"
    in_progress = "in_progress"
    needs_user_action = "needs_user_action"
    ready_for_review = "ready_for_review"
    submitted = "submitted"
    abandoned = "abandoned"


class ApplicationSourceMode(str, enum.Enum):
    manual_export = "manual_export"
    browser_assist = "browser_assist"
    official_api = "official_api"

