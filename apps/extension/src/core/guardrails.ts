/**
 * Guardrails enforced by the extension.
 *
 * Hard constraints:
 * - Never auto-submit application forms.
 * - Never bypass CAPTCHAs, logins, or anti-bot systems.
 * - Only fill from user-approved profile data.
 *
 * Note: This starter repo keeps "fill" disabled until a review UI and approved-facts
 * fetch are implemented.
 */

export const EXTENSION_GUARDRAILS = Object.freeze({
  NEVER_AUTO_SUBMIT: true,
  NEVER_BYPASS_SECURITY: true,
  USER_APPROVED_DATA_ONLY: true
});

