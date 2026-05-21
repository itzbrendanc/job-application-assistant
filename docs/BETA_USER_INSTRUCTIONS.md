# Beta User Instructions

Thanks for joining the private beta. This product is an **AI job application copilot** with **review-first autofill** and **user-controlled submission**.

## 1) Create Your Account
1. Open the web app signup page:
  - Go to `/signup`
2. Enter your email + password.
3. If the beta is invite-only, enter your invite code.
4. After signup, sign in at `/login` if needed.

## 2) Install the Chrome Extension (Private Beta)
This beta uses an unpacked Chrome extension (not yet from the Chrome Web Store).

1. Build is provided by the team, or you will receive a folder/zip.
2. In Chrome, open: `chrome://extensions`
3. Turn on “Developer mode”
4. Click “Load unpacked”
5. Select the extension folder (the team will tell you which folder to choose).
6. Pin the extension (optional) so it’s easy to open.

## 3) Upload Your Resume
1. In the web app, go to `/onboarding`.
2. Upload your resume file.
3. Important: AI-generated content must only use your real experience. Always review before using.

## 4) Use the Extension on Job Sites
Supported targets (best effort during beta):
- Greenhouse, Lever, Workday

Workflow:
1. Open a job application page.
2. Open the extension side panel.
3. Sign in (or create an account) inside the extension if prompted.
4. Click “Detect job + scan fields.”
5. Click “Suggest answers.”
  - You’ll see which fields are supported vs “needs your input.”
6. Review everything.
7. Click “Fill application.”
  - Only approved, non-sensitive fields are filled.
8. You personally submit the application on the site.
9. Click “Record application” to save it to the tracker.

## 5) What Not To Do
- Do not expect automatic submission. The extension will never submit applications for you.
- Do not try to use the extension on CAPTCHA or security challenge pages.
- Do not paste sensitive personal data into “Report issue” messages.
- Always review AI-generated cover letters and suggested answers before using them.

## 6) Report Issues (Fastest Way)
1. On the problem page, open the extension side panel.
2. Click “Report issue.”
3. Describe what happened (keep it short; no sensitive personal data).
  - We automatically include the page URL and which adapter was used.

## 7) Export Your Application Tracker
You can export your tracker to Excel `.xlsx`:
- Web: go to `/applications` and click “Export .xlsx”
- Extension: click “Export tracker (.xlsx)”

## Privacy & Trust Notes
- The extension is designed to be safe by default:
  - no auto-submit
  - no CAPTCHA/login/paywall bypassing
  - user review is required for sensitive/uncertain fields
- During beta, some fields will intentionally require manual entry.

