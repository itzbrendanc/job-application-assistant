# Beta Launch Runbook (Founder/Operator)

This runbook is a practical checklist to get the beta live safely. It assumes you can set environment variables in your hosting provider(s), run shell commands locally, and access the repo.

Product positioning (keep consistent everywhere):
- “AI job application copilot”
- “review-first autofill”
- “user-controlled submission”

Hard constraints (do not violate):
- No auto-submit
- No CAPTCHA/login/paywall bypassing
- No hidden automation
- No fabricated experience

---

## 0) What You Need Before Starting
- A Postgres database (managed or self-hosted).
- Hosting for the API and the web app (staging + production recommended).
- A Stripe account (test mode for beta).
- A Chrome profile for testing the extension.
- A list of your first 20 beta users (emails).

---

## 1) Production Environment Setup

### Web (apps/web) required env vars
Set these in your web hosting environment:
- `NEXT_PUBLIC_API_BASE`
  - Example (prod): `https://api.yourdomain.com`
  - Example (staging): `https://api-staging.yourdomain.com`
- `NEXT_PUBLIC_APP_URL`
  - Example (prod): `https://yourdomain.com`
  - Example (staging): `https://staging.yourdomain.com`

Notes:
- `NEXT_PUBLIC_APP_URL` is used for Stripe redirect URLs on the pricing page.
- `NEXT_PUBLIC_API_BASE` must point to the deployed API base URL (HTTPS for production).

### API (apps/api) required env vars
Set these in your API hosting environment:
- `DATABASE_URL`
  - Example: `postgresql+psycopg://USER:PASSWORD@HOST:5432/DBNAME`
- `APP_ORIGIN`
  - Example (prod): `https://yourdomain.com`
  - Example (staging): `https://staging.yourdomain.com`
- `JWT_SECRET`
  - Use a long random string (do not use the default dev value).
- `ADMIN_EMAILS`
  - Comma-separated emails that can access admin endpoints.
  - Example: `founder@yourdomain.com,ops@yourdomain.com`
- `BETA_INVITE_ONLY`
  - `true` for invite-only beta (recommended)
  - `false` if you want public signups

Optional but recommended:
- `FERNET_SECRET` (for encrypting sensitive tokens if/when used)
- `SENTRY_DSN` / `SENTRY_ENV` (monitoring)

### Stripe test mode env vars (API)
For beta, use Stripe test mode:
- `STRIPE_SECRET_KEY` (starts with `sk_test_...`)
- `STRIPE_WEBHOOK_SECRET` (starts with `whsec_...`)
- `STRIPE_PRICE_PRO_MONTHLY` (a recurring Price ID)
- `STRIPE_PRICE_PRO_ANNUAL` (a recurring Price ID)
- `STRIPE_SUCCESS_URL` (optional)
  - If not set, API falls back to `${APP_ORIGIN}/account/billing`
- `STRIPE_CANCEL_URL` (optional)
  - If not set, API falls back to `${APP_ORIGIN}/pricing`

Important:
- Don’t put Stripe keys in the extension.
- The app uses Stripe Checkout + Customer Portal only (no custom card storage).

---

## 2) Database Setup

### 2.1 Provision Postgres
Pick one:
- Managed (recommended): Neon, Supabase, RDS, etc.
- Self-hosted: Docker/Postgres on a VPS (make sure backups are configured).

### 2.2 Set DATABASE_URL
In your API environment variables, set `DATABASE_URL` to the production database connection string.

### 2.3 Run migrations (required)
From your local machine in the repo root:
```bash
export DATABASE_URL="postgresql+psycopg://USER:PASSWORD@HOST:5432/DBNAME"
bash scripts/migrate_prod.sh
```

Success criteria:
- Script prints “Migrations applied successfully.”

If it fails:
- Double-check `DATABASE_URL`
- Confirm the database is reachable from your machine/network
- Confirm you have installed API dependencies and `alembic` is available (activate the API venv)

---

## 3) Stripe Setup (Test Mode for Beta)

### 3.1 Create products/prices (Stripe dashboard, test mode)
Create:
- Product: “Pro”
- Price: “Pro Monthly” (recurring monthly)
- Price: “Pro Annual” (recurring yearly)

Copy the Price IDs into:
- `STRIPE_PRICE_PRO_MONTHLY`
- `STRIPE_PRICE_PRO_ANNUAL`

### 3.2 Configure webhook endpoint
In Stripe test mode, create a webhook endpoint pointing to:
- `POST https://api.yourdomain.com/api/billing/webhook`

Subscribe to at least:
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- (Optional) `invoice.*`

Copy the webhook signing secret into:
- `STRIPE_WEBHOOK_SECRET`

### 3.3 Test Checkout
Steps:
1. Deploy API + web (Section 4) and confirm both are reachable.
2. Create a user in web:
   - Visit `https://yourdomain.com/signup`
3. Log in:
   - Visit `https://yourdomain.com/login`
4. Upgrade:
   - Visit `https://yourdomain.com/pricing`
   - Click “Upgrade to Pro Monthly”
5. Complete Stripe Checkout using a test card.

Success criteria:
- Redirect returns to your site (billing page).
- API receives Stripe webhook events.
- Billing status shows Pro (active/trialing).

### 3.4 Test Customer Portal
Steps:
1. Visit `https://yourdomain.com/account/billing`
2. Click “Manage subscription”

Success criteria:
- Portal loads
- You can cancel/update payment method
- You return to `/account/billing` successfully

---

## 4) Deploy Web + API

This repo supports Dockerfiles and a production compose example, but your platform may differ. The key is: deploy API first, then web, then run smoke tests.

### 4.1 Deploy API
Deploy `apps/api` and set API env vars from Section 1.

Success criteria:
- `GET https://api.yourdomain.com/healthz` returns 200

### 4.2 Deploy Web
Deploy `apps/web` and set:
- `NEXT_PUBLIC_API_BASE=https://api.yourdomain.com`
- `NEXT_PUBLIC_APP_URL=https://yourdomain.com`

Success criteria:
- `GET https://yourdomain.com/` loads
- `GET https://yourdomain.com/pricing` loads
- `GET https://yourdomain.com/download` loads

### 4.3 Smoke tests (required)
From your local machine:
```bash
export WEB_BASE_URL="https://yourdomain.com"
export API_BASE_URL="https://api.yourdomain.com"
bash scripts/smoke_test.sh
```

Optional:
- If you are not in production and want to test waitlist capture:
```bash
ALLOW_SMOKE_WAITLIST=1 bash scripts/smoke_test.sh
```

---

## 5) Extension Beta Release

### 5.1 Set the API base URL (what users will do)
The extension stores the API base URL in Chrome sync storage. In beta onboarding instructions, tell users the exact API base URL to use:
- Production: `https://api.yourdomain.com`
- Staging: `https://api-staging.yourdomain.com`

### 5.2 Build an extension zip artifact
From repo root:
```bash
bash scripts/build_extension_release.sh
```

Output:
- `extension-release-YYYY-MM-DD.zip`

### 5.3 Private beta install (unpacked)
For private beta users (before Chrome Web Store):
1. In Chrome, open `chrome://extensions`
2. Toggle “Developer mode” on
3. Click “Load unpacked”
4. Select the folder: `apps/extension/dist`
5. Open the side panel and sign in / create account

### 5.4 Later: Chrome Web Store submission
Do this after the private beta is stable:
- Ensure minimal permissions in manifest
- Ensure `/privacy` and `/terms` are finalized and accurate
- Ensure the store listing copy emphasizes:
  - review-first autofill
  - user-controlled submission
  - no auto-submit
  - no bypassing CAPTCHAs/logins/paywalls

---

## 6) Admin Setup (Beta Operations)

### 6.1 Create first admin user
1. Sign up in web: `https://yourdomain.com/signup`
2. Ensure your email is in API env var `ADMIN_EMAILS`.
3. Sign in and go to:
   - `https://yourdomain.com/admin`

Success criteria:
- `/admin` pages load and show analytics summary without 403/401 errors.

### 6.2 Create beta invites (invite-only beta)
If `BETA_INVITE_ONLY=true`:
1. Go to `https://yourdomain.com/admin/waitlist` to view waitlist entries.
2. Create invite:
   - Click “Create invite” next to a waitlist email
3. Retrieve invite code:
   - Use API `GET /api/admin/beta-invites` to see `invite_code` values (MVP behavior).

Recommended improvement later:
- Add “copy invite code” UI (not required for beta).

### 6.3 Daily review surfaces
- Analytics: `https://yourdomain.com/admin/analytics`
- Feedback: `https://yourdomain.com/admin/feedback`
- Waitlist: `https://yourdomain.com/admin/waitlist`
- Support: `https://yourdomain.com/admin/support`

---

## 7) First 20 Beta Users

### Who to invite
Aim for diversity:
- 5 students (Handshake-heavy)
- 5 early-career job seekers (LinkedIn/Indeed)
- 5 experienced applicants (ATS-heavy: Workday/Greenhouse/Lever)
- 5 “power users” who track rigorously (Excel export + follow-ups)

### What to send them (copy/paste template)
Send an email with:
1. Product promise:
   - “AI job application copilot with review-first autofill and user-controlled submission.”
2. Install steps:
   - How to load unpacked extension
3. Account setup:
   - Create account at `/signup` (include invite code if required)
   - Sign in from the extension side panel
4. First test flow:
   - Visit a job application page
   - Detect job + scan fields
   - Suggest answers (approved facts only)
   - Review and fill approved fields
   - Personally submit
   - Record application
   - Export `.xlsx` tracker
5. Safety note:
   - The extension never auto-submits and never bypasses CAPTCHAs/logins/paywalls.
6. Feedback link:
   - `https://yourdomain.com/feedback`
   - Or support form: `https://yourdomain.com/contact`

### Feedback to collect
After 1–2 applications:
- What felt unsafe?
- What was confusing?
- Where did it save time?
- What fields should always require manual entry?
- Which sites worked best/worst?

### Metrics to watch
From `/admin/analytics`:
- `extension_logged_in`
- `job_detected`
- `autofill_started` / `autofill_completed`
- `application_recorded`
- `excel_exported`
- `paywall_hit`
- `checkout_started` / `subscription_active` (if testing billing)

---

## 8) Daily Beta Operating Routine (15–30 min)
1. Check `/admin/analytics`
   - Look for drop-offs (e.g., job_detected high but autofill_completed low)
2. Review `/admin/feedback`
   - Mark reviewed and add internal notes
3. Review `/admin/support`
   - Close resolved issues, add internal notes
4. Triage extension failures
   - Ask users for the page URL + a screenshot + any console output
5. Track conversion signals
   - paywall hits vs upgrades (if enabled)

---

## 9) Go / No-Go Checklist
Go only if all are true:
- Web routes work: `/`, `/pricing`, `/download`, `/signup`, `/login`
- API works: `GET /healthz` returns 200
- Auth works:
  - signup + login works
  - invite-only signup works when enabled
- Extension works:
  - login/signup works
  - detect job + scan fields
  - fill approved fields (never auto-submit)
  - record application
- Tracker/export works:
  - web tracker loads
  - export `.xlsx` works (respecting quota)
- Admin works:
  - `/admin` loads for admin emails
  - waitlist/support/feedback accessible
- If testing billing:
  - Stripe test checkout works end-to-end
  - webhook is receiving events
  - customer portal works
- Legal:
  - `/privacy` and `/terms` have been reviewed by counsel before accepting payments publicly

---

## 10) Emergency Rollback

### Disable checkout (quick)
Options:
- Temporarily remove pricing upgrade CTAs in web (deploy a hotfix)
- Or disable Stripe keys in API env (Checkout endpoints will error; not ideal UX, but stops payments)

### Lock down beta signups
- Set `BETA_INVITE_ONLY=true`
- Revoke invites via `PATCH /api/admin/beta-invites/{invite_id}/revoke` (admin-only)

### Pause extension distribution
- Stop sharing new extension zip builds
- If you already published in Chrome Web Store (later):
  - unpublish or roll back to last known-good version

### Database restore
- Restore from your managed Postgres backups/snapshots.
- Migrations are generally forward-only; use a restore if you need a rollback.

