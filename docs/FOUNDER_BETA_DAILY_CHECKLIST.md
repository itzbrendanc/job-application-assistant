# Founder Beta Daily Checklist (15–30 min)

Goal: keep the beta stable, safe, and improving without expanding scope.

## Daily Routine
1. Check admin analytics:
  - Visit `/admin/analytics`
  - Note:
    - autofill success rate
    - autofill failure rate
    - applications recorded/day
    - paywall hits (if billing is enabled)
2. Review feedback:
  - Visit `/admin/feedback`
  - Filter for `extension_issue`
  - Mark reviewed and add internal notes
3. Review support inbox:
  - Visit `/admin/support`
  - Triage open messages
  - Close resolved issues
4. Fix top 1–2 reliability issues:
  - Prioritize:
    - broken adapters (Greenhouse/Lever/Workday)
    - errors that block recording/exporting
    - confusing UX that causes drop-off
5. Update known issues:
  - Add/confirm entries in `docs/KNOWN_ISSUES.md`
6. Invite new users (if stable):
  - Create invites
  - Send `docs/BETA_USER_INSTRUCTIONS.md`
7. Message beta users:
  - Ask for 1 completed application flow per week
  - Request screenshots/URLs for failures

## Weekly Check-In (30–45 min)
- Review conversion funnel:
  - signups → extension opened → first autofill → application recorded
- Identify the #1 “drop-off” step and fix it.
- Publish a short beta update to users:
  - what changed
  - what’s still limited
  - what you want them to try next

