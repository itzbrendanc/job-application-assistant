import { enforceSitePolicy, pickAdapterForHost } from "./core/adapters";
import { fillFieldValue } from "./core/dom";

function warnNeverAutoSubmit() {
  // Hard constraint: never auto-submit. We do not attach submit handlers or click buttons.
  // This warning is intentionally visible in DevTools for clarity.
  // eslint-disable-next-line no-console
  console.info("[JAA] Guardrails: never auto-submit; never bypass CAPTCHAs/logins; user-approved data only.");
}

warnNeverAutoSubmit();

function detectSource(hostname: string): string {
  const h = hostname.toLowerCase();
  if (h.includes("indeed.")) return "indeed";
  if (h.includes("linkedin.com")) return "linkedin";
  if (h.includes("glassdoor.")) return "glassdoor";
  if (h.includes("joinhandshake.")) return "handshake";
  if (h.endsWith("greenhouse.io")) return "ats_greenhouse";
  if (h.endsWith("lever.co")) return "ats_lever";
  if (h.includes("myworkdayjobs.com") || h.includes("workday")) return "ats_workday";
  if (h.includes("ashbyhq.com")) return "ats_ashby";
  if (h.includes("smartrecruiters.com")) return "ats_smartrecruiters";
  return "company_site";
}

function detectJobMeta(): { jobTitle: string | null; company: string | null; location: string | null } {
  const title = document.querySelector("h1")?.textContent?.trim() || document.title || null;
  const company =
    document.querySelector('[data-company-name]')?.textContent?.trim() ||
    document.querySelector('[class*="company"]')?.textContent?.trim() ||
    null;
  const location =
    document.querySelector('[data-location]')?.textContent?.trim() ||
    document.querySelector('[class*="location"]')?.textContent?.trim() ||
    null;
  return { jobTitle: title, company, location };
}

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg?.type === "jaa.scan") {
    const hostname = window.location.hostname;
    const policy = enforceSitePolicy(hostname);
    const adapter = pickAdapterForHost(hostname);
    const scan = adapter.scan();
    const meta = detectJobMeta();
    const source = detectSource(hostname);
    const payload = { ...scan, jobMeta: { ...meta, jobUrl: window.location.href, sourceWebsite: source } };
    chrome.runtime.sendMessage({ type: "jaa.scan.result", payload: scan });
    sendResponse({ ok: true, policy, scan: payload });
    return true;
  }
  if (msg?.type === "jaa.fill") {
    // Hard constraint: never submit. This only sets field values and returns a report.
    const items: Array<{ fieldId: string; value: string }> = msg.payload?.items ?? [];
    let filled = 0;
    const warnings: string[] = [];
    for (const it of items) {
      const el =
        document.getElementById(it.fieldId) ??
        (it.fieldId ? document.querySelector(`[name="${CSS.escape(it.fieldId)}"]`) : null);
      if (!el) {
        warnings.push(`Field not found: ${it.fieldId}`);
        continue;
      }
      const ok = fillFieldValue(el, it.value);
      if (ok) filled += 1;
      else warnings.push(`Not fillable: ${it.fieldId}`);
    }
    sendResponse({ ok: true, filled, warnings });
    return true;
  }
  return false;
});
