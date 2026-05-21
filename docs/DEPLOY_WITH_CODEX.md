# Deploy With Codex (Assisted Deployment)

This guide explains what you need to create/configure in Vercel (web), Render/Railway (API), Postgres (Neon/Supabase), Stripe test mode, and GitHub Secrets so the included GitHub Actions workflows can deploy with minimal clicks.

Guardrails:
- Do not commit secrets to the repo.
- Use GitHub Secrets for all tokens/keys/URLs.
- Keep beta invite-only and review-first behavior intact.

## Overview
Workflows added:
- `.github/workflows/deploy-web.yml` (Vercel deploy)
- `.github/workflows/deploy-api.yml` (API deploy + migrations)
- `.github/workflows/deploy-extension-release.yml` (build + zip artifact)

All are `workflow_dispatch` (manual) so you control when deployments happen.

---

## 1) Postgres (Neon or Supabase)

### Option A: Neon (recommended for simplicity)
1. Create a Neon project + database.
2. Create a database user/password.
3. Copy the connection string and convert it to SQLAlchemy format:
   - Example (your values differ):
     - `postgresql+psycopg://USER:PASSWORD@HOST/DBNAME?sslmode=require`
4. Save it as GitHub Secret:
   - `API_DATABASE_URL`

### Option B: Supabase
1. Create a Supabase project.
2. Get the Postgres connection string.
3. Use SQLAlchemy format and set as:
   - `API_DATABASE_URL`

Required for migrations and the API runtime.

---

## 2) Stripe (Test Mode)
1. In Stripe test mode, create:
  - Pro Monthly price (recurring monthly)
  - Pro Annual price (recurring yearly)
2. Create a webhook endpoint for:
  - `POST https://YOUR_API_DOMAIN/api/billing/webhook`
3. Subscribe to:
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - (Optional) `invoice.*`
4. Create GitHub Secrets:
  - `STRIPE_SECRET_KEY` (test key)
  - `STRIPE_WEBHOOK_SECRET`
  - `STRIPE_PRICE_PRO_MONTHLY`
  - `STRIPE_PRICE_PRO_ANNUAL`

Note:
- The app uses Stripe Checkout + Customer Portal. No custom card storage.

---

## 3) API Deploy (Render or Railway)

### Recommended: Render (Docker deploy, easiest)
1. Create a Render “Web Service”.
2. Connect your GitHub repo.
3. Choose Docker:
  - Dockerfile: `apps/api/Dockerfile`
4. Set the service root directory if Render asks:
  - Root: repo root
5. Configure environment variables in Render (and/or use GitHub Secrets for deployment workflows):
  - `DATABASE_URL` (use the same value as `API_DATABASE_URL`)
  - `APP_ORIGIN` (your web URL)
  - `JWT_SECRET` (random)
  - `ADMIN_EMAILS` (comma-separated)
  - `BETA_INVITE_ONLY` (`true` recommended)
  - Stripe vars (test mode) if you’re testing billing

6. Create a Render Deploy Hook:
  - Render → your service → Settings → Deploy Hook
  - Copy the URL
  - Save as GitHub Secret: `RENDER_API_DEPLOY_HOOK_URL`

### Railway (alternative)
Railway can deploy Docker as well, but automation varies. If you want one-click GitHub Actions:
- Prefer a Railway “Deploy Hook” equivalent (if available) and store it as a GitHub Secret.
- Otherwise, keep API deploy manual and rely on the migration workflow steps.

---

## 4) Web Deploy (Vercel)

### 4.1 Import the GitHub repo into Vercel
1. Vercel Dashboard → **Add New…** → **Project**
2. Select your GitHub repo and click **Import**
3. In “Configure Project”:
  - **Framework Preset**: Next.js
  - **Root Directory**: `apps/web`

Important for npm workspaces:
- Because this repo is a monorepo with shared workspace packages, configure install/build commands to run from the repo root.

Recommended Vercel Build & Development Settings:
- **Install Command**:
  - `cd ../.. && npm ci`
- **Build Command**:
  - `cd ../.. && npm run build -w apps/web`
- **Output Directory**:
  - leave blank (Next.js default)

### 4.2 Add required Environment Variables in Vercel
Vercel Project → **Settings** → **Environment Variables**
- `NEXT_PUBLIC_API_BASE` = `https://YOUR_API_DOMAIN`
- `NEXT_PUBLIC_APP_URL` = `https://YOUR_WEB_DOMAIN`
- (Optional) `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (Stripe test publishable key)

Apply to:
- Preview and Production environments (and Development if you use Vercel dev envs).

### 4.3 Get Vercel deploy credentials for GitHub Actions
You will store these in GitHub Secrets.

1) `VERCEL_TOKEN`
- Vercel → **Account Settings** → **Tokens** → create a token

2) `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID`
- Install Vercel CLI locally:
  - `npm i -g vercel`
- From repo root, run:
  - `vercel link`
- After linking, read:
  - `.vercel/project.json`
- Copy values:
  - `orgId` → `VERCEL_ORG_ID`
  - `projectId` → `VERCEL_PROJECT_ID`

### 4.4 Add GitHub Secrets for the web deploy workflow
GitHub Repo → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

Required for `.github/workflows/deploy-web.yml`:
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`
- `NEXT_PUBLIC_API_BASE`
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (optional)

### 4.5 Run the web deploy workflow
1. GitHub → **Actions**
2. Select **Deploy Web (Vercel)**
3. Click **Run workflow**
  - Choose `production` (or `staging` if you prefer)
4. Watch logs until “Deploy to Vercel” completes

After deploy:
- Run smoke tests:
```bash
export WEB_BASE_URL="https://YOUR_WEB_DOMAIN"
export API_BASE_URL="https://YOUR_API_DOMAIN"
bash scripts/smoke_test.sh
```

---

## 5) GitHub Secrets Checklist

### Vercel (web)
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

### Render (API)
- `RENDER_API_DEPLOY_HOOK_URL`

### API runtime + migrations
- `API_DATABASE_URL`
- `API_APP_ORIGIN` (e.g. `https://yourdomain.com`)
- `API_JWT_SECRET`
- `API_ADMIN_EMAILS`
- `API_BETA_INVITE_ONLY` (`true`/`false`)

### Stripe (test mode, optional for beta)
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_PRO_MONTHLY`
- `STRIPE_PRICE_PRO_ANNUAL`
- `STRIPE_SUCCESS_URL` (optional)
- `STRIPE_CANCEL_URL` (optional)

---

## 6) One-Click-ish Deploy Flow (After Secrets Are Set)

1. Deploy API (and run migrations):
  - GitHub → Actions → “Deploy API” → Run workflow
2. Deploy Web:
  - GitHub → Actions → “Deploy Web (Vercel)” → Run workflow
3. Build extension release artifact:
  - GitHub → Actions → “Build Extension Release Artifact” → Run workflow
4. Smoke test:
```bash
export WEB_BASE_URL="https://YOUR_WEB_DOMAIN"
export API_BASE_URL="https://YOUR_API_DOMAIN"
bash scripts/smoke_test.sh
```

---

## 7) Deployment Checklist (Human Steps)
- Confirm `/privacy` and `/terms` are reviewed by counsel before accepting payments publicly.
- Confirm `BETA_INVITE_ONLY=true` for the first wave.
- Confirm `ADMIN_EMAILS` includes you.
- Confirm `GET https://YOUR_API_DOMAIN/healthz` returns 200.
- Confirm web pages load:
  - `/`, `/pricing`, `/download`, `/signup`, `/login`
- Confirm extension:
  - can sign in
  - can scan a Greenhouse or Lever application form
  - never auto-submits
