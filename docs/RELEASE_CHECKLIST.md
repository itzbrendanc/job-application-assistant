# Release Checklist (Beta)

This checklist is for a safe, compliance-first beta release. The product is positioned as an **AI job application copilot** with **review-first autofill** and **user-controlled submission**.

## Configuration
- Web env vars configured:
  - `NEXT_PUBLIC_API_BASE` points to your API (HTTPS in production)
- API env vars configured:
  - `DATABASE_URL` (production database)
  - `APP_ORIGIN` (web origin for CORS)
  - `JWT_SECRET` set to a strong value
  - `ADMIN_EMAILS` set to your team/admin emails
  - `BETA_INVITE_ONLY` set intentionally (`true` for invite-only beta)
- Stripe (test mode):
  - `STRIPE_SECRET_KEY` is test (`sk_test_...`)
  - `STRIPE_WEBHOOK_SECRET` is test (`whsec_...`)
  - `STRIPE_PRICE_PRO_MONTHLY` and `STRIPE_PRICE_PRO_ANNUAL` exist and are test Prices
- Legal pages reviewed (required before accepting payments publicly):
  - `/privacy` reviewed and finalized
  - `/terms` reviewed and finalized

## Database
- Alembic migrations applied on production DB:
  - run `scripts/migrate_prod.sh` with `DATABASE_URL` set
- Seed data:
  - confirm you are not running demo seeds in production unless intended

## Chrome Extension
- Extension build verified locally:
  - `npm run build -w apps/extension`
- API base URL for the extension:
  - confirm the production API URL is set in extension configuration (side panel)
  - ensure `/download` instructions reflect the current beta install flow
- Guardrails confirmed:
  - no auto-submit behavior
  - no CAPTCHA/login/paywall bypassing
  - user review required before filling and submission

## Smoke Tests
- Web routes return 200:
  - `/`
  - `/pricing`
  - `/download`
- API health returns 200:
  - `GET /healthz`
- Run the provided script:
  - `WEB_BASE_URL=... API_BASE_URL=... bash scripts/smoke_test.sh`
- Optional beta-only checks:
  - waitlist endpoint accepts payload in non-production only

## Rollback Plan
- Have a rollback plan before sending invites:
  - last known-good container image tags (web + api)
  - quick “disable beta signups” plan:
    - set `BETA_INVITE_ONLY=true`
  - quick “disable billing” plan:
    - unpublish pricing links or temporarily disable checkout in UI
  - database rollback plan:
    - migrations are forward-only by default; restore from backup if needed

## First Beta Invites
- Confirm `ADMIN_EMAILS` is set (admin endpoints require it).
- Create invites:
  - `POST /api/admin/beta-invites` for each beta email
- Share onboarding instructions:
  - web: upload resume + confirm facts
  - extension: sign in, detect job, review-first autofill, record application

