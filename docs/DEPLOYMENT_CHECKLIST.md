# Deployment Checklist (Private Beta)

This checklist assumes you will deploy:
- Web: Vercel
- API: Render (Docker) + Postgres (Neon/Supabase)
- Stripe: test mode only

## A) Create Secrets (GitHub)
Repo → Settings → Secrets and variables → Actions → New repository secret

Web (Vercel):
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`
- `NEXT_PUBLIC_API_BASE` (example: `https://api.yourdomain.com`)
- `NEXT_PUBLIC_APP_URL` (example: `https://yourdomain.com`)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (optional for beta)

API (Render):
- `RENDER_API_DEPLOY_HOOK_URL`

Database (for migrations job):
- `API_DATABASE_URL`

Stripe test mode (optional for beta billing tests):
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_PRO_MONTHLY`
- `STRIPE_PRICE_PRO_ANNUAL`
- `STRIPE_SUCCESS_URL` (optional)
- `STRIPE_CANCEL_URL` (optional)

## B) Click Setup (Vercel)
1. Create a Vercel project for `apps/web`
2. Set Environment Variables in Vercel:
  - `NEXT_PUBLIC_API_BASE`
  - `NEXT_PUBLIC_APP_URL`
  - (Optional) `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

## C) Click Setup (Render)
1. Create a Web Service from this repo
2. Use Dockerfile: `apps/api/Dockerfile`
3. Set Render environment variables:
  - `DATABASE_URL`
  - `APP_ORIGIN`
  - `JWT_SECRET`
  - `ADMIN_EMAILS`
  - `BETA_INVITE_ONLY=true` (recommended)
  - Stripe vars (test mode) if testing billing
4. Create a Deploy Hook and save it as `RENDER_API_DEPLOY_HOOK_URL`

## D) Deploy (One-click after secrets)
GitHub → Actions:
1. Run “Deploy API (Render Hook + Migrations)”
  - Keep `run_migrations=true` for most deploys
2. Run “Deploy Web (Vercel)”
3. Run “Build Extension Release Artifact”

## E) Smoke Test (Required)
From your machine:
```bash
export WEB_BASE_URL="https://yourdomain.com"
export API_BASE_URL="https://api.yourdomain.com"
bash scripts/smoke_test.sh
```

## F) Beta Onboarding Check
- Visit `/signup` and create a test account (invite-only: use an invite code).
- Load extension unpacked and confirm:
  - sign in works
  - Detect → Suggest → Fill works on a Greenhouse or Lever page
  - Never auto-submits

