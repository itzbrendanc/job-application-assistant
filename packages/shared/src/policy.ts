/**
 * Compliance-first policy flags shared between web/app/extension.
 *
 * Hard constraints:
 * - Never auto-submit applications.
 * - Never bypass CAPTCHAs, login protections, or anti-bot systems.
 * - Only use user-approved profile data for answering/filling/generating.
 */

export const HARD_CONSTRAINTS = Object.freeze({
  NEVER_AUTO_SUBMIT: true,
  NEVER_BYPASS_SECURITY: true,
  USER_APPROVAL_REQUIRED_FOR_SENSITIVE: true,
  USER_APPROVED_DATA_ONLY: true
});

export type SiteAutomationMode =
  | "official_api"
  | "browser_assist"
  | "manual_export"
  | "blocked";

export function allowedAutomationModeForHost(hostname: string): SiteAutomationMode {
  // Default-safe stance: manual export unless explicitly allowed.
  // Extend with a reviewed allowlist per destination.
  const host = hostname.toLowerCase();
  if (host.endsWith("greenhouse.io")) return "browser_assist";
  if (host.endsWith("lever.co")) return "browser_assist";
  return "manual_export";
}

