from __future__ import annotations

from app.services.approval import determine_if_sensitive


KNOWN_KEYS = [
    ("email", ["email"]),
    ("phone", ["phone", "mobile", "tel"]),
    ("full_name", ["full name", "name"]),
    ("linkedin_url", ["linkedin"]),
    ("portfolio_url", ["portfolio", "website", "github"]),
]


def map_fields(fields: list[dict]) -> list[dict]:
    mapped: list[dict] = []
    for f in fields:
        label = (f.get("label") or "").lower()
        name = (f.get("name") or "").lower()
        ph = (f.get("placeholder") or "").lower()
        aria = (f.get("aria_label") or "").lower()
        auto = (f.get("autocomplete") or "").lower()
        blob = f"{label} {name} {ph} {aria} {auto}".strip()

        mapped_key = None
        confidence = 0.0
        for key, hints in KNOWN_KEYS:
            if any(h in blob for h in hints):
                mapped_key = key
                confidence = 0.85
                break

        # De-risk over-matching "name": prefer full name patterns, avoid mapping company/job "name" fields.
        if mapped_key == "full_name":
            if "company" in blob or "employer" in blob or "job" in blob or "position" in blob:
                mapped_key = None
                confidence = 0.0

        sensitive = determine_if_sensitive(f.get("label") or f.get("name") or "")
        mapped.append(
            {
                "field_id": f["field_id"],
                "mapped_key": mapped_key,
                "confidence": confidence,
                "is_sensitive": sensitive.needs_user_approval,
                "needs_user_approval": sensitive.needs_user_approval,
                "reason": sensitive.reason,
            }
        )
    return mapped


def suggest_answers(*, mapped: list[dict], approved_profile: dict) -> list[dict]:
    # Guardrail: only use approved_profile facts; never guess.
    suggested: list[dict] = []
    for m in mapped:
        if m.get("needs_user_approval"):
            suggested.append(
                {
                    "field_id": m["field_id"],
                    "value": None,
                    "confidence": 0.0,
                    "needs_user_approval": True,
                    "reason": m.get("reason") or "Sensitive field",
                }
            )
            continue

        key = m.get("mapped_key")
        if not key:
            suggested.append(
                {
                    "field_id": m["field_id"],
                    "value": None,
                    "confidence": 0.0,
                    "needs_user_approval": True,
                    "reason": "Unmapped/uncertain field; user review required.",
                }
            )
            continue

        value = approved_profile.get(key)
        if value is None:
            suggested.append(
                {
                    "field_id": m["field_id"],
                    "value": None,
                    "confidence": 0.0,
                    "needs_user_approval": True,
                    "reason": "No approved value available for this field.",
                }
            )
            continue

        suggested.append(
            {
                "field_id": m["field_id"],
                "value": str(value),
                "confidence": float(m.get("confidence") or 0.0),
                "needs_user_approval": False,
                "reason": None,
            }
        )
    return suggested
