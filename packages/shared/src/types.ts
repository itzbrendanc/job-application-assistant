export type UUID = string;

export type ApprovalStatus = "pending" | "approved" | "rejected";

export type SensitiveFieldCategory =
  | "eeo"
  | "salary"
  | "work_authorization"
  | "visa_status"
  | "identity"
  | "other";

export type User = {
  id: UUID;
  email: string;
  createdAt: string;
};

export type UserProfile = {
  id: UUID;
  userId: UUID;
  fullName: string | null;
  headline: string | null;
  summary: string | null;
  locationText: string | null;
  remotePreference: "remote" | "hybrid" | "onsite" | null;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string | null;
  visaStatus: string | null;
  workAuthorization: string | null;
  availabilityDate: string | null; // YYYY-MM-DD
  linkedinUrl: string | null;
  portfolioUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ProfileFact = {
  id: UUID;
  profileId: UUID;
  factType: string;
  factKey: string;
  factValue: unknown;
  sourceType: "resume" | "linkedin" | "user_edit" | "import" | "other";
  sourceRef: string | null;
  confidence: number | null; // 0..1
  approvalStatus: ApprovalStatus;
  createdAt: string;
  updatedAt: string;
};

export type Job = {
  id: UUID;
  source: string;
  sourceUrl: string | null;
  companyName: string;
  title: string;
  locationText: string | null;
  remoteType: "remote" | "hybrid" | "onsite" | "unknown";
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string | null;
  description: string;
  importedAt: string;
};

export type JobFit = {
  userId: UUID;
  jobId: UUID;
  score: number; // 0..100
  matchReasons: string[];
  mismatchReasons: string[];
  uncertainties: string[];
  computedAt: string;
};

export type Application = {
  id: UUID;
  userId: UUID;
  jobId: UUID;
  status:
    | "draft"
    | "in_progress"
    | "needs_user_action"
    | "ready_for_review"
    | "submitted"
    | "abandoned";
  sourceMode: "manual_export" | "browser_assist" | "official_api";
  createdAt: string;
  updatedAt: string;
  submittedAt: string | null;
};

export type AuditEvent = {
  id: UUID;
  userId: UUID;
  applicationId: UUID | null;
  actorType: "user" | "system" | "admin";
  eventType: string;
  eventPayload: Record<string, unknown>;
  createdAt: string;
};

