# Job Application Assistant (Starter Repo)

Trustworthy, compliance-first job application assistant SaaS. This repo is a runnable starter that prioritizes user control, auditability, and non-fabrication guardrails.

## What’s included
- `apps/api`: FastAPI + Postgres + Alembic, core domain APIs and service skeletons
- `apps/web`: Next.js app (dashboard + onboarding + job flow)
- `apps/extension`: Chrome Extension MV3 side panel (extension-first application workflow)
- `packages/shared`: shared TypeScript types/utilities used by web + extension
- `infra`: Docker + local Postgres setup

## Hard constraints (enforced)
- No fabricated user experience in AI-generated content
- No bypassing CAPTCHAs, login protections, or anti-bot systems
- No auto-submission of applications
- Use user-approved data only
- Audit logs for every sensitive action
- AI-generated content is reviewable/editable

## Supported sites (detection + scan)
- Indeed, LinkedIn, Glassdoor, Handshake
- Greenhouse, Lever, Workday, Ashby, SmartRecruiters
- Generic company career pages

## Extension-first workflow
- Install the Chrome extension and sign in from the side panel.
- On a job application page, click `Detect job + scan fields`.
- Click `Suggest answers` to get:
  - field mapping + confidence
  - suggested answers using backend-approved profile facts only
  - a tailored cover letter (editable)
- Review/edit everything, then click `Fill application` to fill non-sensitive fields only.
- Final submission is always a separate user action on the website (the extension never clicks submit).
- Click `Record application` to save a tracker record + audit log.

What is automated vs user-approved:
- Automated: form scanning, conservative mapping, fetching approved facts, preparing suggestions, filling non-sensitive fields after review.
- User-approved: sensitive fields (EEO/salary/auth), unmapped fields, final submission, edits to generated content.

## Free vs paid
- Free: 10 tracked applications/month (enforced across record/export/cover letters/extension autofill)
- Pro Monthly / Pro Annual: unlimited tracker + extension autofill + cover letters

## Quickstart

### 1) Start Postgres
```bash
docker compose -f infra/docker-compose.yml up -d
```

### 2) Backend (FastAPI)
Prereq: Python `3.13.x` is recommended. Python `3.14.x` may fail to install `pydantic-core` until upstream wheels/tooling catches up.

```bash
cd apps/api
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp ../../.env.example ../../.env
alembic upgrade head
python -m app.seed
uvicorn app.main_check:app --reload --port 8000
```

Open: `http://localhost:8000/docs`

### 3) Shared types
```bash
npm install
npm run build -w packages/shared
```

### 4) Web (Next.js)
```bash
npm run dev -w apps/web
```

Open: `http://localhost:3000`

### 5) Chrome extension
```bash
npm run build -w apps/extension
```
Then load `apps/extension/dist` in Chrome: `chrome://extensions` → Developer mode → Load unpacked.

Open the side panel:
- Click the extension icon and choose “Open”
- Or use Chrome’s Side Panel picker if available

Sign-in:
- Web: create an account at `/signup` or sign in at `/login`.
- Extension: use the side panel Sign in / Create account buttons (API `POST /api/auth/login` and `POST /api/auth/signup`).
- Optional seed user: `demo@example.com` / `password123` (created by `python -m app.seed`)

## Excel tracker
- Export: `GET /api/applications/export/xlsx` (also available in the side panel).
- Import: `POST /api/applications/import/xlsx` (upload your `.xlsx` tracker).

## Stripe setup (subscriptions)
This repo uses Stripe Checkout (subscription mode) and the Stripe Customer Portal. It does not store card data.

1) Create products/prices in Stripe
- Create 2 recurring Prices:
  - Pro Monthly (recurring monthly)
  - Pro Annual (recurring yearly)

2) Set environment variables in `.env`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_PRO_MONTHLY`
- `STRIPE_PRICE_PRO_ANNUAL`
- Recommended redirect config:
  - Web: `NEXT_PUBLIC_APP_URL` (e.g. `https://yourdomain.com`)
  - API: `STRIPE_SUCCESS_URL` and `STRIPE_CANCEL_URL` (optional; the API falls back to `${APP_ORIGIN}/account/billing` and `${APP_ORIGIN}/pricing`)

3) Webhook
- Configure a Stripe webhook endpoint to: `POST /api/billing/webhook`
- Subscribe to at least:
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.*` (optional)

4) Test flows
- Create checkout session: `POST /api/billing/checkout`
- Open billing portal: `POST /api/billing/portal`
- Check status/quota: `GET /api/billing/status`

## Production deployment (starter)
- Dockerfiles:
  - `apps/api/Dockerfile`
  - `apps/web/Dockerfile`
- Production compose: `infra/docker-compose.prod.yml`
- Health checks:
  - API: `GET /healthz`

## Chrome Web Store checklist (starter)
- Publish `/privacy` and `/terms` with clear data handling
- Minimal permissions only; explain why each permission is needed
- No deceptive install prompts or hidden behavior
- No affiliate injection, redirects, or unrelated background actions
- No mass auto-apply positioning; describe as a copilot
- User must personally submit applications; no auto-submit
- No CAPTCHA/login/paywall bypassing or anti-bot evasion

## Scripts
- `npm run dev:web`: start Next.js dev server
- `npm run build:shared`: build shared TS package
- `npm run build:extension`: build extension into `apps/extension/dist`
- `npm run lint`: lint web + extension + shared
- `npm run test`: unit tests (shared TS; API tests require Python deps)

Note: The API is Python; for local dev you run it in a venv (see above). Node scripts exist for TS-only tooling.

## Marketing routes (web)
- `/`: marketing homepage
- `/pricing`: plans + Stripe Checkout entry points
- `/download`: extension install and trust/permissions explanation
- `/privacy`, `/terms`: policy pages
- `/contact`: support contact
- `/feedback`: beta feedback form

Stripe checkout behavior:
- Pricing “Upgrade” buttons call the backend `/api/billing/checkout` endpoint and redirect to Stripe Checkout.

Beta extension install flow:
- Build: `npm run build -w apps/extension`
- Load unpacked: `chrome://extensions` → Developer mode → Load unpacked → `apps/extension/dist`

## Beta feedback
- Web form: `/feedback`
- API endpoint: `POST /api/feedback`
- Feedback is persisted in Postgres via `feedback_messages` (backend `/api/telemetry/feedback`).

## Beta analytics + feedback storage
- Analytics events are persisted in Postgres via `analytics_events` (backend `/api/telemetry/analytics`).
- Feedback is persisted in Postgres via `feedback_messages` (backend `/api/telemetry/feedback`).
- The Next.js endpoints `/api/analytics` and `/api/feedback` forward to the backend for persistence.

## Invite-only beta
To run an invite-only beta, set:
- `BETA_INVITE_ONLY=true` (API)

Then `POST /api/auth/signup` requires `invite_code` for the user’s email, and the invite is marked `accepted` after signup.

Admin endpoints (require `ADMIN_EMAILS` + an admin user token):
- `POST /api/admin/beta-invites` (create/reset an invite for an email)
- `GET /api/admin/beta-invites` (list invites)
- `PATCH /api/admin/beta-invites/{invite_id}/revoke`

Waitlist capture:
- Public: `POST /api/waitlist` (also wired to the marketing “Join beta” form)
- Admin: `GET /api/admin/waitlist` (used by `/admin/waitlist`)

Support intake:
- Public: `POST /api/support` (wired to `/contact`)
- Admin: `GET /api/admin/support`, `PATCH /api/admin/support/{message_id}` (used by `/admin/support`)

## Admin dashboard (beta)
Admin routes (web):
- `/admin`: admin home
- `/admin/analytics`: conversion metrics + recent events
- `/admin/feedback`: feedback inbox (filters + reviewed state)
- `/admin/waitlist`: waitlist inbox + invite creation shortcut
- `/admin/support`: support inbox (open/reviewed/closed)

Admin APIs (backend):
- `GET /api/admin/analytics/summary`
- `GET /api/admin/analytics/events`
- `GET /api/admin/feedback`
- `PATCH /api/admin/feedback/{feedback_id}`

Tracked metrics in the summary:
- `checkout_started`, `subscription_active`, `extension_logged_in`, `job_detected`, `autofill_started`, `autofill_completed`, `application_recorded`, `excel_exported`, `paywall_hit`

## Environment variables
Web (`apps/web`):
- `NEXT_PUBLIC_API_BASE` (required in production): e.g. `https://api.yourdomain.com`
- `NEXT_PUBLIC_APP_URL` (recommended in production): e.g. `https://yourdomain.com` (used for Stripe redirect URLs)

API (`apps/api`):
- `DATABASE_URL`
- `APP_ORIGIN` (web origin allowed by CORS)
- `JWT_SECRET`
- `ADMIN_EMAILS` (comma-separated list of admin user emails; required to access `/api/admin/*`)
- `BETA_INVITE_ONLY` (when true, signup requires a valid invite code)
- Stripe:
  - `STRIPE_SECRET_KEY`
  - `STRIPE_WEBHOOK_SECRET`
  - `STRIPE_PRICE_PRO_MONTHLY`
  - `STRIPE_PRICE_PRO_ANNUAL`
  - `STRIPE_SUCCESS_URL` (optional; fallback is `${APP_ORIGIN}/account/billing`)
  - `STRIPE_CANCEL_URL` (optional; fallback is `${APP_ORIGIN}/pricing`)

Extension (`apps/extension`):
- API base URL is configured in the Side Panel “API base URL” field (stored in `chrome.storage.sync`).

## Deployment (starter)
- Dockerfiles:
  - `apps/web/Dockerfile`
  - `apps/api/Dockerfile`
- Production compose example: `infra/docker-compose.prod.yml`
- Health checks:
  - API: `GET /healthz`

## Running API tests in Docker (Python 3.13)
Prereq: Docker installed locally.

From repo root:
```bash
docker build -t jaa-api-test -f apps/api/Dockerfile apps/api
docker run --rm -t jaa-api-test python -m pytest -q
```

Or:
```bash
bash scripts/api_tests_docker.sh
```

## CI checks
GitHub Actions runs:
- Node: `npm ci`, `npm run build -w apps/web`, `npm run lint -w apps/web`, `npm run build -w apps/extension`, `npm test -w packages/shared`
- API: Python 3.13 `pytest` on `apps/api/tests` (Postgres service container available; tests do not require real Stripe/OpenAI secrets)

## Release (beta)
Release checklist:
- See `docs/RELEASE_CHECKLIST.md`

Build an extension release zip:
```bash
bash scripts/build_extension_release.sh
```

Run migrations (production):
```bash
export DATABASE_URL="postgresql+psycopg://..."
bash scripts/migrate_prod.sh
```

Smoke test a deployment:
```bash
export WEB_BASE_URL="https://your-web-domain.com"
export API_BASE_URL="https://api.yourdomain.com"
bash scripts/smoke_test.sh
```

Invite first beta users (invite-only mode):
1. Set `BETA_INVITE_ONLY=true` in the API environment.
2. Ensure `ADMIN_EMAILS` includes your admin email.
3. Create invites via `POST /api/admin/beta-invites`, then share each user’s `invite_code` for signup.

GitHub Actions manual release workflow:
- `.github/workflows/release.yml` runs builds/tests and uploads an extension zip artifact (no auto-deploy).
