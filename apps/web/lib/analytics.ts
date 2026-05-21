export type AnalyticsEventName =
  | "signup_started"
  | "signup_completed"
  | "resume_uploaded"
  | "extension_opened"
  | "extension_logged_in"
  | "job_detected"
  | "autofill_started"
  | "autofill_completed"
  | "autofill_failed"
  | "application_recorded"
  | "excel_exported"
  | "checkout_started"
  | "subscription_active"
  | "paywall_hit";

export type AnalyticsEvent = {
  name: AnalyticsEventName;
  ts: string;
  anonymousId?: string;
  props?: Record<string, unknown>;
  source?: "web" | "extension" | "backend";
};

/**
 * Analytics stub.
 *
 * Beta default: do not send to any provider.
 * Guardrail: never include resumes, full answers, or payment data in props.
 */
export async function track(name: AnalyticsEventName, props?: Record<string, unknown>) {
  const ev: AnalyticsEvent = {
    name,
    ts: new Date().toISOString(),
    anonymousId: getAnonymousId(),
    props,
    source: "web"
  };
  try {
    // Fire-and-forget to a stub endpoint for future wiring.
    await fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(ev),
      keepalive: true
    });
  } catch {
    // ignore in beta
  }
}

function getAnonymousId(): string | undefined {
  if (typeof window === "undefined") return undefined;
  const k = "jaa_anon_id";
  const existing = window.localStorage.getItem(k);
  if (existing) return existing;
  const id = crypto?.randomUUID ? crypto.randomUUID() : String(Math.random()).slice(2);
  window.localStorage.setItem(k, id);
  return id;
}
