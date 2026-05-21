# Trustworthy Job-Application Assistant SaaS

## 1. Product Requirements Document

### 1.1 Product vision
Build a trustworthy job-application assistant that helps users discover relevant jobs, prepare accurate application materials, and complete applications faster across major job platforms and ATS systems without violating platform rules or removing user control.

### 1.2 Product principles
- User approval before any sensitive action.
- No fabricated resume or cover-letter content.
- Compliance-first automation.
- Clear explanations for AI decisions.
- Strong privacy, auditability, and deletion controls.

### 1.3 Primary users
- Active job seekers applying to many roles.
- Career switchers needing tailored materials.
- Students and early-career applicants using Handshake and campus portals.
- Experienced professionals managing multiple resume variants.

### 1.4 User problems
- Re-entering the same profile data across many ATS systems.
- Difficulty identifying which jobs are actually a good fit.
- Time wasted tailoring resumes and cover letters.
- Fear of inaccurate AI output damaging credibility.
- Limited visibility into what was submitted where.

### 1.5 Core jobs to be done
- Import and normalize a candidate profile.
- Find high-fit jobs quickly.
- Generate truthful, tailored application materials.
- Autofill applications with review checkpoints.
- Track application status and history.

### 1.6 Non-goals for MVP
- Fully autonomous application submission.
- CAPTCHA solving or bypassing security controls.
- Mass application blasting.
- Deep recruiter CRM features.
- Interview coaching beyond light follow-up prompts.

### 1.7 Functional requirements

#### Onboarding
- Users can upload one or more resumes.
- Users can connect LinkedIn, portfolio links, and job preferences.
- System extracts and normalizes:
  - Skills
  - Work history
  - Education
  - Projects
  - Certifications
  - Location
  - Salary range
  - Visa/work authorization
  - Availability
- Users can review, edit, accept, or reject extracted data before it becomes profile truth.

#### Job discovery
- Users can search/import jobs by role, location, salary, seniority, remote preference, industry, and keywords.
- System supports jobs from:
  - Indeed
  - LinkedIn
  - Glassdoor
  - Handshake
  - Company career pages
  - Supported ATS boards or official APIs where permitted
- Each job shows:
  - Fit score
  - Match reasons
  - Mismatch reasons
  - Missing or uncertain requirements

#### Application preparation
- Tailored resumes are generated only from approved profile data.
- Tailored cover letters use only real user experience and approved preferences.
- AI must not invent employers, achievements, degrees, certifications, dates, or skills.
- All generated assets are versioned and diffable.

#### Form filling
- Browser-based assistant suggests values for common forms.
- Supported targets include:
  - Workday
  - Greenhouse
  - Lever
  - Ashby
  - SmartRecruiters
  - Company-hosted pages
- Sensitive, uncertain, or regulated questions require explicit user confirmation.
- EEO questions must be optional and clearly separated from core profile data.

#### Submission policy
- No automatic submission without a deliberate user action.
- Final review screen must show:
  - Company
  - Role
  - Resume version
  - Cover letter version
  - All answers
  - Disclosures
- User must click a clear `Submit application` control.
- System respects robots.txt, rate limits, platform terms, login boundaries, and anti-bot restrictions.

#### Trust and safety
- Every application action is audit logged.
- Users can see what data was sent and to which destination.
- Automation is opt-in and scoped.
- Users can delete profile data and generated assets.
- AI-generated text is clearly labeled.

### 1.8 Success metrics
- Median time from job import to application-ready package.
- Autofill completion rate for supported ATS flows.
- Percentage of generated materials accepted by users without manual rewrite.
- User-reported trust score.
- Error rate for autofill events and submission-precheck events.
- Percentage of applications with full audit trails.

### 1.9 Risks and mitigations
- Hallucinated content in resumes or letters.
  - Mitigation: retrieval-bound generation from approved profile facts only.
- Terms-of-service violations.
  - Mitigation: compliance rules engine, per-site capability registry, human-in-the-loop submission.
- Mishandling sensitive personal data.
  - Mitigation: encryption, field-level access control, data minimization, deletion flows.
- Bad fit scoring leading to poor recommendations.
  - Mitigation: transparent explanations, user feedback loop, adjustable weighting.

## 2. System Architecture

### 2.1 Recommended stack
- Frontend: Next.js with React
- Backend/API: Next.js route handlers or separate FastAPI service
- Database: PostgreSQL
- Queue: BullMQ with Redis
- File storage: S3-compatible object storage
- Browser assistant: extension + controlled in-app browser session where permitted
- LLM layer: provider abstraction for parsing, fit scoring, and content generation
- Observability: OpenTelemetry, structured logs, error tracking, metrics dashboard

### 2.2 High-level architecture
```text
Web App (Next.js)
  -> Auth + Session Layer
  -> Profile Builder UI
  -> Job Discovery UI
  -> Resume/Cover Letter Editor
  -> Application Tracker
  -> Browser Assistant UI

API Layer
  -> User/Profile Service
  -> Resume Parsing Service
  -> Job Ingestion Service
  -> Fit Scoring Service
  -> Document Generation Service
  -> Application Session Service
  -> Audit/Compliance Service

Async Workers
  -> Resume parse jobs
  -> Job import/sync jobs
  -> Fit score recalculation
  -> Document rendering jobs
  -> Form-fill telemetry processing

Data Stores
  -> Postgres
  -> Redis
  -> Encrypted object storage
  -> Secrets manager
```

### 2.3 Service responsibilities

#### Frontend
- User onboarding and profile editing
- Job search and fit explanation surfaces
- Resume and cover-letter version review
- Final application review and explicit submission action
- Tracker dashboard and audit-log viewer

#### Profile service
- Stores canonical user profile
- Stores source provenance for each field
- Manages approved vs extracted vs inferred data states

#### Resume parsing service
- Parses resumes and portfolio sources into structured candidate facts
- Uses deterministic extraction plus LLM normalization
- Emits confidence scores and review tasks

#### Job ingestion service
- Ingests jobs through official APIs, feeds, uploads, bookmarks, or user-guided imports
- Normalizes titles, compensation, location, seniority, and skills
- Maintains source metadata and usage permissions

#### Fit scoring service
- Calculates weighted fit score
- Produces explanation objects with positive and negative factors
- Never hides uncertainty

#### Document generation service
- Builds tailored resumes and cover letters from approved facts only
- Maintains prompt, source fact set, and output version history

#### Application session service
- Starts an application session for a target job
- Tracks form field suggestions, user edits, approvals, and final submissions
- Enforces sensitive-question approval rules

#### Audit/compliance service
- Immutable event logs
- Data transmission ledger
- Policy checks for site support, rate limits, and automation mode

### 2.4 Compliance-first automation model
- `Official API mode`: use first when available.
- `Permitted browser assist mode`: user-guided autofill only, no hidden submission.
- `Manual export mode`: generate resume, cover letter, and answer pack for manual completion.
- `Blocked mode`: if a target site disallows automation or behavior is uncertain, disable autofill and show manual workflow.

## 3. Database Schema

### 3.1 Core entities

#### users
- id UUID PK
- email CITEXT UNIQUE
- password_hash TEXT NULL
- auth_provider TEXT
- created_at TIMESTAMPTZ
- deleted_at TIMESTAMPTZ NULL

#### user_profiles
- id UUID PK
- user_id UUID FK users.id
- full_name TEXT
- headline TEXT
- summary TEXT
- location_city TEXT
- location_region TEXT
- location_country TEXT
- remote_preference TEXT
- salary_min INTEGER NULL
- salary_max INTEGER NULL
- salary_currency TEXT NULL
- visa_status TEXT NULL
- work_authorization TEXT NULL
- availability_date DATE NULL
- linkedin_url TEXT NULL
- portfolio_url TEXT NULL
- website_url TEXT NULL
- profile_status TEXT
- created_at TIMESTAMPTZ
- updated_at TIMESTAMPTZ

#### profile_facts
- id UUID PK
- profile_id UUID FK user_profiles.id
- fact_type TEXT
- fact_key TEXT
- fact_value JSONB
- source_type TEXT
- source_ref TEXT
- confidence NUMERIC(5,4)
- approval_status TEXT
- created_at TIMESTAMPTZ
- updated_at TIMESTAMPTZ

#### resumes
- id UUID PK
- user_id UUID FK users.id
- source_file_id UUID NULL
- name TEXT
- status TEXT
- created_at TIMESTAMPTZ

#### resume_versions
- id UUID PK
- resume_id UUID FK resumes.id
- version_number INTEGER
- content_json JSONB
- rendered_file_id UUID NULL
- generated_by TEXT
- source_fact_snapshot JSONB
- change_summary TEXT
- created_at TIMESTAMPTZ

#### cover_letters
- id UUID PK
- user_id UUID FK users.id
- created_at TIMESTAMPTZ

#### cover_letter_versions
- id UUID PK
- cover_letter_id UUID FK cover_letters.id
- job_id UUID NULL
- version_number INTEGER
- body_markdown TEXT
- generated_by TEXT
- source_fact_snapshot JSONB
- created_at TIMESTAMPTZ

#### jobs
- id UUID PK
- external_source TEXT
- external_job_id TEXT
- source_url TEXT
- company_name TEXT
- title TEXT
- location_text TEXT
- remote_type TEXT
- salary_min INTEGER NULL
- salary_max INTEGER NULL
- salary_currency TEXT NULL
- seniority TEXT NULL
- employment_type TEXT NULL
- description_raw TEXT
- description_normalized JSONB
- requirements JSONB
- posted_at TIMESTAMPTZ NULL
- imported_at TIMESTAMPTZ

#### job_searches
- id UUID PK
- user_id UUID FK users.id
- filters JSONB
- created_at TIMESTAMPTZ

#### job_fit_scores
- id UUID PK
- user_id UUID FK users.id
- job_id UUID FK jobs.id
- score NUMERIC(5,2)
- explanation JSONB
- gaps JSONB
- computed_at TIMESTAMPTZ

#### applications
- id UUID PK
- user_id UUID FK users.id
- job_id UUID FK jobs.id
- status TEXT
- source_mode TEXT
- resume_version_id UUID NULL
- cover_letter_version_id UUID NULL
- final_answers JSONB
- submitted_at TIMESTAMPTZ NULL
- created_at TIMESTAMPTZ
- updated_at TIMESTAMPTZ

#### application_sessions
- id UUID PK
- application_id UUID FK applications.id
- platform_type TEXT
- session_status TEXT
- started_at TIMESTAMPTZ
- ended_at TIMESTAMPTZ NULL

#### application_form_fields
- id UUID PK
- session_id UUID FK application_sessions.id
- field_name TEXT
- field_label TEXT
- field_type TEXT
- field_value_suggested TEXT NULL
- field_value_final TEXT NULL
- confidence NUMERIC(5,4) NULL
- is_sensitive BOOLEAN DEFAULT FALSE
- needs_user_approval BOOLEAN DEFAULT FALSE
- approval_status TEXT
- source_fact_refs JSONB

#### audit_logs
- id UUID PK
- user_id UUID FK users.id
- application_id UUID NULL
- actor_type TEXT
- event_type TEXT
- event_payload JSONB
- created_at TIMESTAMPTZ

#### data_transmissions
- id UUID PK
- user_id UUID FK users.id
- application_id UUID NULL
- destination_type TEXT
- destination_name TEXT
- destination_url TEXT NULL
- payload_summary JSONB
- transmitted_at TIMESTAMPTZ

#### files
- id UUID PK
- user_id UUID FK users.id
- storage_key TEXT
- file_type TEXT
- mime_type TEXT
- encrypted BOOLEAN
- created_at TIMESTAMPTZ

#### oauth_connections
- id UUID PK
- user_id UUID FK users.id
- provider TEXT
- external_account_id TEXT
- scopes TEXT[]
- access_token_ref TEXT
- refresh_token_ref TEXT NULL
- created_at TIMESTAMPTZ
- revoked_at TIMESTAMPTZ NULL

### 3.2 Important indexes
- `jobs(external_source, external_job_id)` unique
- `job_fit_scores(user_id, job_id)` unique
- `applications(user_id, job_id)`
- `profile_facts(profile_id, fact_type, approval_status)`
- `audit_logs(user_id, created_at desc)`

## 4. API Endpoints

### 4.1 Auth and account
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `POST /api/auth/oauth/:provider/connect`
- `DELETE /api/account`

### 4.2 Profile and onboarding
- `POST /api/profile/resume/upload`
- `POST /api/profile/parse`
- `GET /api/profile`
- `PATCH /api/profile`
- `GET /api/profile/facts`
- `PATCH /api/profile/facts/:factId`
- `POST /api/profile/import/linkedin`
- `POST /api/profile/import/portfolio`

### 4.3 Job discovery
- `POST /api/jobs/search`
- `POST /api/jobs/import`
- `GET /api/jobs/:jobId`
- `GET /api/jobs/:jobId/fit`
- `POST /api/jobs/:jobId/save`

### 4.4 Documents
- `POST /api/resumes/generate`
- `GET /api/resumes`
- `GET /api/resumes/:resumeId/versions`
- `POST /api/cover-letters/generate`
- `GET /api/cover-letters/:coverLetterId/versions`
- `POST /api/documents/:documentId/restore-version`

### 4.5 Applications and form filling
- `POST /api/applications`
- `GET /api/applications`
- `GET /api/applications/:applicationId`
- `POST /api/applications/:applicationId/start-session`
- `POST /api/applications/:applicationId/field-suggestions`
- `PATCH /api/applications/:applicationId/answers`
- `POST /api/applications/:applicationId/final-review`
- `POST /api/applications/:applicationId/submit`

### 4.6 Audit and privacy
- `GET /api/audit-logs`
- `GET /api/applications/:applicationId/transmissions`
- `POST /api/privacy/export`
- `DELETE /api/privacy/data`

### 4.7 Example response shapes

#### `GET /api/jobs/:jobId/fit`
```json
{
  "jobId": "uuid",
  "score": 84.5,
  "matchReasons": [
    "5 years of backend experience aligns with the role requirement",
    "User has direct BullMQ and PostgreSQL experience"
  ],
  "mismatchReasons": [
    "Role prefers Go, which is not in approved skills"
  ],
  "uncertainties": [
    "Visa sponsorship requirement is not clearly stated in the posting"
  ]
}
```

#### `POST /api/applications/:applicationId/submit`
```json
{
  "applicationId": "uuid",
  "status": "submitted",
  "submittedAt": "2026-05-20T20:00:00Z",
  "auditLogId": "uuid"
}
```

## 5. User Flow

### 5.1 End-to-end flow
1. User creates an account and consents to data processing.
2. User uploads a resume and optionally connects LinkedIn and portfolio sources.
3. System parses candidate facts and asks the user to approve or edit them.
4. User sets job preferences and search filters.
5. System imports or searches jobs and computes fit scores.
6. User opens a job and reviews match/mismatch explanations.
7. User generates a tailored resume and cover letter for the job.
8. User reviews generated assets, version history, and highlighted source facts.
9. User starts an application session.
10. Browser assistant suggests answers and autofills approved non-sensitive fields.
11. Sensitive or uncertain fields are paused for user confirmation.
12. Final review screen shows all materials and answers.
13. User explicitly clicks `Submit application`.
14. System records audit log, transmissions, and tracker status.

### 5.2 Key UX states
- `Needs review`: extracted facts with low confidence.
- `Ready to apply`: profile + materials approved.
- `User action required`: sensitive field, CAPTCHA, login, or unsupported target.
- `Manual mode`: export packet when automation is not permitted.

## 6. Security Model

### 6.1 Data classification
- Public: job postings and company metadata.
- Confidential: user profile, resume, cover letters, application answers.
- Sensitive personal data: work authorization, salary, EEO responses, tokens, contact details.

### 6.2 Core controls
- Encrypt data at rest and in transit.
- Field-level encryption for highly sensitive fields.
- Token references stored separately from raw tokens where possible.
- Least-privilege OAuth scopes.
- Role-based access control for internal operators.
- Tenant isolation by user/account boundary.
- Signed URLs with short TTL for document access.

### 6.3 Application security
- Secure session handling with rotation and expiration.
- CSRF protection for state-changing browser actions.
- Input validation on all API boundaries.
- Rate limiting and abuse detection.
- Security headers and strict CSP.
- Secrets in managed secret store only.

### 6.4 AI safety controls
- Retrieval-bound prompts using approved user facts only.
- Fact-check gate before document publishing.
- Explicit labels for AI-generated content.
- Prompt and output logging for internal debugging with redaction.
- Safe fallback when confidence is low: ask user, do not guess.

### 6.5 Compliance controls
- Site capability registry with allowed modes per destination.
- Automated blocks for unsupported automation flows.
- No CAPTCHA solving, credential stuffing, or anti-bot evasion.
- Immutable audit logs for application lifecycle events.
- User-initiated deletion and data export flows.

## 7. MVP Development Roadmap

### Phase 1: Foundations
- Set up auth, user accounts, Postgres, Redis, and encrypted file storage.
- Build profile schema and resume upload flow.
- Add audit-log primitives and policy engine skeleton.

### Phase 2: Profile intelligence
- Implement resume parsing pipeline.
- Add LinkedIn/portfolio import adapters where officially supported.
- Build profile review and approval UI.

### Phase 3: Job discovery
- Add manual job import and saved-search UI.
- Integrate permitted job sources and normalization pipeline.
- Implement fit scoring with explanations.

### Phase 4: Document generation
- Add tailored resume and cover-letter generation.
- Add version history, restore, and source-fact traceability.

### Phase 5: Application assistant
- Build user-approved browser autofill for a small set of ATS targets.
- Add sensitive-question gating and final review screen.
- Record transmissions and submission audit trails.

### Phase 6: Tracker and hardening
- Build application tracker dashboard.
- Add observability, retry handling, and error reporting.
- Add deletion/export workflows and security hardening.

## 8. Example Code Structure

```text
apps/
  web/
    src/
      app/
        (marketing)/
        (app)/
          onboarding/
          profile/
          jobs/
          documents/
          applications/
          dashboard/
        api/
          profile/
          jobs/
          resumes/
          cover-letters/
          applications/
          audit-logs/
      components/
        profile/
        jobs/
        documents/
        applications/
        dashboard/
      lib/
        auth/
        db/
        llm/
        validation/
        policies/
        telemetry/
      styles/
  worker/
    src/
      jobs/
        parse-resume.ts
        import-jobs.ts
        score-fit.ts
        generate-documents.ts
      queues/
      lib/
  extension/
    src/
      content-scripts/
      background/
      popup/
packages/
  db/
    schema/
    migrations/
  ui/
  types/
  config/
  prompts/
    parsing/
    fit-scoring/
    cover-letters/
  policies/
    site-capabilities/
    submission-rules/
  observability/
docs/
  prd/
  architecture/
  security/
```

## 9. Suggested MVP Feature Cuts

### In scope
- Email/password plus one OAuth provider
- Resume upload and parsing
- Editable canonical profile
- Manual job import plus selected supported sources
- Fit scoring with explanations
- Tailored cover letter generation
- Tailored resume generation for 1 to 2 templates
- User-approved autofill for Greenhouse and Lever first
- Application tracker dashboard

### Out of scope
- Broad ATS coverage at launch
- Mobile app
- Team collaboration
- Interview scheduling
- One-click mass applications

## 10. Recommended Technical Decisions

### Frontend
- Use Next.js for app shell, authenticated dashboard, and API routes when possible.
- Use server-rendered dashboard pages plus client components for editors and browser-session controls.

### Backend
- Start with a modular monolith.
- Keep services separated by domain boundaries inside one repo before splitting into microservices.

### LLM design
- Use structured outputs for profile facts and fit explanations.
- Store prompt version and input fact snapshot for every generated artifact.
- Use deterministic rules before LLMs when extracting dates, salaries, and location fields.

### ATS support strategy
- Start with:
  - Manual export mode for all destinations
  - Greenhouse autofill
  - Lever autofill
- Add Workday after instrumenting field mapping variability and approval checkpoints.

## 11. Example Fit Scoring Logic

### Weighted factors
- Required skills match: 30%
- Relevant work experience: 25%
- Seniority alignment: 15%
- Location/remote fit: 10%
- Industry/domain overlap: 10%
- Compensation alignment: 5%
- Authorization/visa compatibility: 5%

### Explanation rules
- Every score must include at least one positive and one negative or uncertainty factor when applicable.
- Missing facts should appear as uncertainty, not silent penalties.
- Scores should be user-adjustable over time with preference tuning.

## 12. Launch Readiness Checklist
- Privacy policy and terms aligned to automation boundaries
- Data deletion path tested end-to-end
- Audit logs visible to users
- AI labels present in generated content flows
- Sensitive-question approval gating tested
- Compliance mode per destination verified
- Observability dashboard live for parsing, scoring, and form-fill failures

