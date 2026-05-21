# Beta Launch Checklist

This checklist is optimized for a trustworthy, compliance-first beta. The product is positioned as an **AI job application copilot** with **review-first autofill** and **user-controlled submission**.

## Stripe (Test Mode)
- Create Products/Prices:
  - Pro Monthly (recurring monthly)
  - Pro Annual (recurring yearly)
- Confirm `.env` values in test mode:
  - `STRIPE_SECRET_KEY` starts with `sk_test_`
  - `STRIPE_WEBHOOK_SECRET` starts with `whsec_`
  - `STRIPE_PRICE_PRO_MONTHLY` and `STRIPE_PRICE_PRO_ANNUAL` are valid Price IDs
- Webhook endpoint configured:
  - `POST /api/billing/webhook`
- Event subscriptions enabled:
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.*` (optional)
- Test flows:
  - Checkout from `/pricing` and `/account/billing`
  - Subscription becomes `active` after webhook
  - Customer Portal opens and can cancel/update payment method
- Confirm no card data is stored by the app (Stripe-hosted Checkout/Portal only).

## Chrome Extension (Beta Install)
- Build produces `apps/extension/dist` successfully.
- Unpacked install steps documented on `/download`:
  - `chrome://extensions` → Developer mode → Load unpacked → `apps/extension/dist`
- Verify side panel flow:
  - Sign-in
  - Detect job + scan fields
  - Suggest answers (approved facts only)
  - Fill non-sensitive fields only
  - Record application
  - Export tracker shortcut
- Confirm extension does NOT:
  - auto-submit forms
  - bypass CAPTCHAs/logins/paywalls
  - run hidden automation
- Confirm extension stores:
  - session auth token only in `chrome.storage.session`
  - API base URL in `chrome.storage.sync`
  - no payment data

## Chrome Web Store Submission (Prep)
- Developer Program Policies reviewed for:
  - data use disclosure
  - deceptive behavior prohibition
  - permission justification
- Permission minimization:
  - only request permissions required for scanning/filling + side panel + downloads
- Store listing copy:
  - “AI job application copilot”
  - “review-first autofill”
  - “user-controlled submission”
  - avoid “mass apply”, “auto-apply”, or anything implying bypassing security controls
- Privacy disclosures ready:
  - what data is collected
  - how it’s used
  - what is sent to third parties (only on user action)
  - deletion/export instructions

## Privacy/Terms Readiness
- Legal review required before accepting real payments:
  - have counsel review `/privacy`, `/terms`, pricing copy, and refund/cancellation language
  - confirm Stripe Customer Portal cancellation UX aligns with your terms
- `/privacy` includes:
  - data categories collected (profile, resumes, applications)
  - data retention policy
  - deletion/export flow
  - audit log concept
  - contact method
- `/terms` includes:
  - acceptable use policy (no abuse/spam)
  - no circumvention (CAPTCHAs/logins/paywalls)
  - user responsibility for accuracy and submission
  - limitation of liability / beta disclaimer

## First 20 Beta Users
- Invite list assembled (mix of job seekers + students + experienced applicants).
- Onboarding checklist:
  - install extension
  - login
  - upload resume + approve facts
  - run 1 application end-to-end
- Collect structured feedback:
  - “what felt unsafe?”
  - “what felt confusing?”
  - “what saved the most time?”
- Set expectations:
  - supported sites vary by page layout
  - some fields will be intentionally “ask user”
  - user-controlled submission always required

## Analytics Checklist (Stub First)
- Events captured (see app analytics list).
- No real analytics provider required for beta; store/log locally until configured.
- Ensure events contain no sensitive content:
  - never include resumes, full answers, or payment info
  - include only event name + minimal metadata

## Support/Contact Checklist
- Footer includes support email placeholder.
- `/contact` page present with:
  - support email
  - response expectations
- `/feedback` page present and functional.
- Decide on a support queue:
  - email alias
  - ticket system later (optional)

## Known Limitations (Current)
- AI layer is stubbed and conservative; replace with production provider + guardrails.
- Extension field mapping is heuristic; site DOM changes can reduce accuracy.
- Some ATS flows are intentionally manual for sensitive/uncertain fields.
- Web auth is token-based MVP; production should move to secure cookies/refresh tokens.
