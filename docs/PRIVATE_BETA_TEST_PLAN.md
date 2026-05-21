# Private Beta Test Plan

Goal: validate reliability and trust of the “AI job application copilot” workflow (review-first autofill, user-controlled submission) across Greenhouse, Lever, and Workday, plus tracking/export and issue reporting.

## Who Should Test First (Order)
1. Internal team (1–3 people)
  - Confirm deployment, auth, admin access, and basic extension workflow.
2. Friendly power users (3–5 people)
  - People who apply frequently and will tolerate rough edges.
3. Diverse ATS testers (10–15 people)
  - A mix of Greenhouse-heavy, Lever-heavy, and Workday-heavy applicants.
4. Broader invite-only beta (up to 20 total)

## 10 Beta Tasks Users Should Complete
1. Create an account (invite-only: enter invite code).
2. Sign in on web and confirm dashboard loads.
3. Upload a resume on `/onboarding`.
4. Install the Chrome extension (unpacked) and sign in from the side panel.
5. On a job page, run “Detect job + scan fields.”
6. Run “Suggest answers” and confirm unmapped/sensitive fields are clearly marked as requiring user input.
7. Run “Fill application” and confirm only approved/non-sensitive fields are filled.
8. Personally submit the application on the site (the extension must not submit).
9. Click “Record application” and confirm it appears in the web tracker.
10. Export the tracker to `.xlsx` (from web or extension) and confirm the file downloads.

## Greenhouse Test Flow
Target page type: Greenhouse application form (`greenhouse.io`).
1. Open a Greenhouse application page.
2. Open extension side panel.
3. Click “Detect job + scan fields.”
  - Pass: job meta appears and fields list is non-empty.
4. Click “Suggest answers.”
  - Pass: suggested answers show, with warnings for unmapped/sensitive fields.
5. Click “Fill application.”
  - Pass: some fields filled; no submit button clicked; warning shown if partial.
6. Personally submit on the site.
7. Click “Record application.”
  - Pass: application appears in `/applications`.

## Lever Test Flow
Target page type: Lever application form (`lever.co`).
1. Open a Lever application page.
2. Run the same Detect → Suggest → Fill steps.
3. Verify fields fill correctly and any unsupported fields are flagged.

## Workday Test Flow
Target page type: Workday apply flow (`myworkdayjobs.com`).
1. Navigate into the Workday application form where inputs are visible.
2. Run Detect → Suggest → Fill.
3. Pass criteria for Workday:
  - It is acceptable for more fields to be “unsupported/needs review.”
  - The extension must never submit or bypass login/CAPTCHA.

## Extension Login/Signup Test
1. Open side panel.
2. Confirm API base URL is set correctly.
3. Create account (if allowed) or sign in.
4. Force-expire session by signing out and signing back in.
  - Pass: expired session is handled gracefully, user sees “please sign in again.”

## Resume Upload Test
1. Go to `/onboarding`.
2. Upload a resume.
  - Pass: upload completes; no crash; “resume_uploaded” analytics event fires (best-effort).

## Application Tracking Test
1. After recording an application from the extension, open `/applications`.
2. Update status and follow-up date.
  - Pass: fields save and reload.

## Excel Export Test
1. From `/applications` click Export `.xlsx` (or use extension export).
  - Pass: `.xlsx` downloads; opens in Excel/Google Sheets with headers visible.

## Report Issue Test
1. In extension side panel, click “Report issue.”
2. Enter a short message.
  - Pass: report is accepted and shows “Issue report sent.”
3. Admin checks `/admin/feedback` for “extension_issue” category.

## Checkout Test (Stripe Test Mode)
Pre-req: Stripe test mode configured (`STRIPE_*` env vars + webhook).
1. Sign in on web.
2. Go to `/pricing` and start Pro Monthly checkout.
3. Complete Stripe Checkout using a test card.
4. Return to `/account/billing` and confirm status updates after webhook.
5. Open Customer Portal and confirm it loads.

## What Feedback To Collect
After 1 full application flow:
- Was anything confusing or unsafe?
- Did the extension ever try to submit? (Must be “no.”)
- Which fields were filled correctly?
- Which fields were unsupported?
- Were warnings clear and helpful?
- Did Workday/Greenhouse/Lever behave differently?
- Did “Report issue” work and feel easy?

## Pass/Fail Criteria
Pass for private beta:
- Users can sign up/sign in (invite-only flow works if enabled).
- Extension can scan fields on at least one ATS (Greenhouse/Lever) reliably.
- Extension never auto-submits or clicks submit.
- Unsupported fields are clearly flagged.
- Application can be recorded and exported to `.xlsx`.
- Issue reporting works (feedback stored and visible in admin).

Fail (block beta invites) if any occur:
- Any auto-submit behavior.
- Any attempt to bypass CAPTCHA/login restrictions.
- Frequent silent failures with no error/warning surfaced.
- Stripe test checkout redirects broken in your deployed environment.

