# Beta Readiness Audit

Date: 2026-05-20

Scope: audit the repo for beta launch blockers and readiness across auth, invite-only signup, Stripe test checkout, quota enforcement, extension workflow/guardrails, Excel export, waitlist/support, admin dashboard, migrations, env docs, CI/release workflows, and legal placeholders.

## Ready Now
- **Extension guardrails (no auto-submit / no bypassing security controls)**:
  - Content script explicitly logs guardrails and only fills fields (never clicks submit). See `apps/extension/src/content.ts`.
  - Fill logic excludes hidden/submit fields; adapters are “fill-only” by contract.
- **Quota enforcement (free vs pro)**:
  - Centralized enforcement via `require_active_subscription_or_free_quota()` with clear `402 upgrade_required` errors. See `apps/api/app/services/billing/usage.py`.
  - Applied to: application record, Excel export, cover letters, extension autofill endpoints.
- **Excel export/import**:
  - `.xlsx` export with formatting and a timestamped filename. See `apps/api/app/services/xlsx_tracker.py` and `GET /api/applications/export/xlsx`.
- **Waitlist + support persistence (backend)**:
  - Waitlist: `POST /api/waitlist` stores entries.
  - Support: `POST /api/support` stores messages.
- **Admin dashboard (beta)**:
  - Analytics and feedback admin endpoints exist and are admin-only via `ADMIN_EMAILS`.
  - Admin pages exist for analytics, feedback, waitlist, and support under `/admin/*`.
- **Telemetry storage**:
  - Analytics events and feedback messages are stored in Postgres via `analytics_events` and `feedback_messages`.
- **CI + manual release workflow**:
  - CI runs web/extension/shared builds and API tests without real secrets.
  - Manual release workflow builds and uploads the extension artifact zip.
- **Marketing and beta support surfaces**:
  - `/download`, `/privacy`, `/terms`, `/contact`, `/feedback` exist and are routed.

## Needs Manual Setup (Expected for Beta)
- **Database + migrations**:
  - Ensure `DATABASE_URL` points to production Postgres and run `scripts/migrate_prod.sh` before beta users.
- **Environment variables**:
  - Web: `NEXT_PUBLIC_API_BASE` must be set to your API base URL for real deployments.
  - API: `APP_ORIGIN`, `JWT_SECRET`, `ADMIN_EMAILS`, `BETA_INVITE_ONLY`, Stripe vars (if testing billing).
- **Stripe test mode setup**:
  - Create Stripe test products/prices and set `STRIPE_PRICE_PRO_MONTHLY` / `STRIPE_PRICE_PRO_ANNUAL`.
  - Configure webhook secret and endpoint (`POST /api/billing/webhook`).
- **Admin access**:
  - `ADMIN_EMAILS` must include your account email for `/api/admin/*`.
- **Extension production API URL**:
  - The extension API base URL is configured from the side panel (stored in `chrome.storage.sync`).
  - For beta onboarding, clearly communicate the production API base URL to testers.

## Must Fix Before Beta (Launch Blockers)
None detected for a closed beta, assuming you complete the “Needs Manual Setup” items.

## Must Fix Before Paid Public Launch
- **Legal readiness**
  - `/privacy` and `/terms` are explicitly placeholders and require legal review before accepting payments publicly.
  - Paid public launch should include finalized policies, refund/cancellation language, and data retention/deletion policy.
- **Authentication hardening**
  - Token-in-localStorage is not ideal for production. A public paid launch should move to a more robust session approach (secure cookies/refresh tokens, CSRF strategy where relevant).
- **Operational hardening**
  - Confirm rate limits and logging policies in production (no PII leakage).
  - Add production monitoring/alerting (Sentry/metrics) and runbooks.
- **Extension store readiness**
  - Ensure minimal permissions, accurate Chrome Web Store listing, privacy disclosures, and review-first positioning throughout.

## Nice-to-Have Later
- Admin UX improvements:
  - “Copy invite code” UI, inline invite list, revoke-from-waitlist actions.
  - Pagination and better filtering for large waitlist/support queues.
- Waitlist double opt-in + email automation (provider integration).
- Support integration (ticket system / email integration).
- Better job meta extraction in extension (site-specific selectors) and more robust adapter coverage.

## Security / Compliance Concerns (Watch List)
- **Avoid PII in analytics**:
  - Continue keeping raw emails/resumes/outbound form answers out of analytics events. Prefer minimal metadata.
- **Extension permissions and behavior**:
  - Keep permissions minimal; keep “fill only” behavior and “never submit” guardrail explicit in docs and UI.
- **Do not imply prohibited behavior**:
  - Ensure copy avoids “mass auto-apply”, “bot”, or any implication of bypassing CAPTCHAs/logins.

## Recommended First 20 Beta User Plan
1. **Start with invite-only beta**:
  - Set `BETA_INVITE_ONLY=true` and create invites for each tester via `POST /api/admin/beta-invites`.
2. **Onboarding script (15 minutes)**:
  - Install extension (unpacked beta).
  - Sign in (provide credentials or a signup path).
  - Upload resume and review extracted profile facts.
  - On a job site: Detect job → scan fields → suggest answers → review → fill approved fields.
  - Record application and export Excel tracker.
3. **Collect structured feedback after 1 application**:
  - What felt unsafe?
  - What was confusing?
  - What saved the most time?
  - Which fields were intentionally “ask user” and felt correct vs frustrating?
4. **Weekly triage cadence**:
  - Review `/admin/feedback`, `/admin/support`, analytics summary and recent events.
  - Prioritize adapter breakages and “blocked by paywall/quota unexpectedly” reports.

## Verification Snapshot (Local)
- `npm run build -w apps/web`: pass
- `npm run lint -w apps/web`: pass
- `npm run build -w apps/extension`: pass
- `npm test -w packages/shared`: pass

## Beta Readiness Score
**9/10** for an invite-only beta.

Primary remaining risks are operational/manual setup (env vars + migrations + Stripe test mode configuration) and overall auth hardening for a paid public launch.
