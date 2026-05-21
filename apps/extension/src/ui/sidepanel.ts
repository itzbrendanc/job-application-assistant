import { apiFetch, downloadXlsx, publicFetch, trackExtensionEvent } from "./api";
import { getApiBase, setApiBase } from "./config";
import { clearToken, getToken, setToken } from "./storage";

async function sendToActiveTab(message: any) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) throw new Error("No active tab");
  return chrome.tabs.sendMessage(tab.id, message);
}

type ScanPayload = {
  url: string;
  hostname: string;
  adapter: string;
  fields: Array<{
    id: string;
    name: string | null;
    label: string | null;
    type: string;
    required: boolean;
    autocomplete: string | null;
  }>;
  jobMeta: { jobTitle: string | null; company: string | null; location: string | null; jobUrl: string; sourceWebsite: string };
};

const statusEl = document.getElementById("status")!;
const authOut = document.getElementById("authOut") as HTMLPreElement;
const out = document.getElementById("out") as HTMLPreElement;
const answersOut = document.getElementById("answersOut") as HTMLPreElement;
const coverLetter = document.getElementById("coverLetter") as HTMLTextAreaElement;

const emailEl = document.getElementById("email") as HTMLInputElement;
const passwordEl = document.getElementById("password") as HTMLInputElement;
const apiBaseEl = document.getElementById("apiBase") as HTMLInputElement;
const loginBtn = document.getElementById("login") as HTMLButtonElement;
const signupBtn = document.getElementById("signup") as HTMLButtonElement;
const logoutBtn = document.getElementById("logout") as HTMLButtonElement;
const inviteWrap = document.getElementById("inviteWrap") as HTMLDivElement;
const inviteCodeEl = document.getElementById("inviteCode") as HTMLInputElement;

const scanBtn = document.getElementById("scan") as HTMLButtonElement;
const suggestBtn = document.getElementById("suggest") as HTMLButtonElement;
const fillBtn = document.getElementById("fill") as HTMLButtonElement;
const recordBtn = document.getElementById("record") as HTMLButtonElement;
const exportBtn = document.getElementById("exportXlsx") as HTMLButtonElement;
const openPanelBtn = document.getElementById("openPanel") as HTMLButtonElement;
const reportIssueBtn = document.getElementById("reportIssue") as HTMLButtonElement;
const warnBox = document.getElementById("warnBox") as HTMLDivElement;

let scan: ScanPayload | null = null;
let mapped: any[] = [];
let suggested: Array<{ field_id: string; value: string | null; needs_user_approval: boolean; reason?: string | null }> = [];
let applicationId: string | null = null;
let billingStatus: any | null = null;
let betaInviteOnly = false;
let appOrigin: string | null = null;
let lastError: string | null = null;

function stripTrailingSlash(url: string): string {
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

function setWarning(msg: string | null) {
  if (!msg) {
    warnBox.style.display = "none";
    warnBox.textContent = "";
    return;
  }
  warnBox.style.display = "block";
  warnBox.textContent = msg;
}

function handleError(e: unknown) {
  const msg = e instanceof Error ? e.message : "Unknown error";
  lastError = msg;
  // If token expired, apiFetch clears it; prompt the user to sign in again.
  if (msg.startsWith("401")) {
    authOut.textContent = "Session expired. Please sign in again.";
  }
  setWarning(msg);
  return msg;
}

async function refreshPublicConfig() {
  try {
    const cfg = await publicFetch<{ beta_invite_only: boolean; app_origin?: string }>("/api/public/config");
    betaInviteOnly = Boolean(cfg.beta_invite_only);
    appOrigin = typeof cfg.app_origin === "string" ? cfg.app_origin : null;
  } catch {
    betaInviteOnly = false;
    appOrigin = null;
  }
  inviteWrap.hidden = !betaInviteOnly;
}

async function refreshAuthState() {
  const token = await getToken();
  const signedIn = Boolean(token);
  statusEl.textContent = signedIn ? "Signed in" : "Signed out";
  suggestBtn.disabled = !signedIn || !scan;
  fillBtn.disabled = !signedIn || suggested.length === 0;
  recordBtn.disabled = !signedIn || !applicationId;
  exportBtn.disabled = !signedIn;

  if (signedIn) {
    try {
      billingStatus = await apiFetch("/api/billing/status");
      const plan = billingStatus?.plan ?? "free";
      const remaining = billingStatus?.free_quota_remaining;
      statusEl.textContent =
        plan === "pro" ? "Pro (unlimited)" : `Free (${remaining ?? "?"}/10 left)`;
    } catch {
      // ignore
    }
    inviteWrap.hidden = true;
  } else {
    billingStatus = null;
    inviteWrap.hidden = !betaInviteOnly;
  }
}

async function initApiBase() {
  const base = await getApiBase();
  apiBaseEl.value = base;
  apiBaseEl.addEventListener("change", async () => {
    await setApiBase(apiBaseEl.value);
    authOut.textContent = "Saved API base URL.";
    await refreshPublicConfig();
    await refreshAuthState();
  });
}

openPanelBtn.addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.id) await chrome.sidePanel.open({ tabId: tab.id });
});

loginBtn.addEventListener("click", async () => {
  authOut.textContent = "Signing in…";
  setWarning(null);
  try {
    const res = await apiFetch<{ access_token: string }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: emailEl.value, password: passwordEl.value })
    });
    await setToken(res.access_token);
    authOut.textContent = "Signed in.";
    void trackExtensionEvent("extension_logged_in", {});
    void trackExtensionEvent("extension_opened", { surface: "sidepanel_after_login" });
  } catch (e) {
    authOut.textContent = handleError(e);
  } finally {
    await refreshAuthState();
  }
});

signupBtn.addEventListener("click", async () => {
  authOut.textContent = "Creating account…";
  setWarning(null);
  try {
    const res = await apiFetch<{ access_token: string }>("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify({
        email: emailEl.value,
        password: passwordEl.value,
        invite_code: betaInviteOnly ? inviteCodeEl.value : undefined
      })
    });
    await setToken(res.access_token);
    authOut.textContent = "Account created. Signed in.";
    void trackExtensionEvent("extension_logged_in", { surface: "extension_signup" });
    void trackExtensionEvent("extension_opened", { surface: "sidepanel_after_signup" });
  } catch (e) {
    const msg = handleError(e);
    authOut.textContent = msg;
    if (msg.includes("Invite code required")) {
      betaInviteOnly = true;
      inviteWrap.hidden = false;
    }
  } finally {
    await refreshAuthState();
  }
});

logoutBtn.addEventListener("click", async () => {
  await clearToken();
  authOut.textContent = "Signed out.";
  setWarning(null);
  await refreshAuthState();
});

scanBtn.addEventListener("click", async () => {
  out.textContent = "Scanning page…";
  setWarning(null);
  answersOut.textContent = "";
  coverLetter.value = "";
  applicationId = null;
  suggested = [];
  mapped = [];
  try {
    const res: any = await sendToActiveTab({ type: "jaa.scan" });
    scan = res.scan as ScanPayload;
    out.textContent = JSON.stringify(scan.jobMeta, null, 2) + "\n\nFields:\n" + JSON.stringify(scan.fields.slice(0, 50), null, 2);
    void trackExtensionEvent("job_detected", { host: scan.hostname, source: scan.jobMeta.sourceWebsite });

    // Create job record + fit on backend
    const token = await getToken();
    if (token) {
      const detectRes = await apiFetch<{ jobId: string }>("/api/extension/jobs/detect", {
        method: "POST",
        body: JSON.stringify({
          job_url: scan.jobMeta.jobUrl,
          job_title: scan.jobMeta.jobTitle,
          company: scan.jobMeta.company,
          location: scan.jobMeta.location,
          source_website: scan.jobMeta.sourceWebsite,
          fields: scan.fields.map((f) => ({
            field_id: f.id,
            name: f.name,
            label: f.label,
            field_type: f.type,
            required: f.required,
            autocomplete: f.autocomplete,
            placeholder: (f as any).placeholder ?? null,
            aria_label: (f as any).aria_label ?? null,
            data_automation_id: (f as any).data_automation_id ?? null,
            form: (f as any).form ?? null,
          }))
        })
      });
      const draft = await apiFetch<{ application_id: string; status: string }>("/api/extension/applications/draft", {
        method: "POST",
        body: JSON.stringify({
          job_id: detectRes.jobId,
          job_url: scan.jobMeta.jobUrl,
          company: scan.jobMeta.company,
          job_title: scan.jobMeta.jobTitle,
          location: scan.jobMeta.location,
          source_website: scan.jobMeta.sourceWebsite
        })
      });
      applicationId = draft.application_id;
    }
    void trackExtensionEvent("extension_opened", { surface: "sidepanel_scan", adapter: scan.adapter });
  } catch (e) {
    out.textContent = handleError(e);
  } finally {
    await refreshAuthState();
  }
});

suggestBtn.addEventListener("click", async () => {
  if (!scan) return;
  out.textContent = "Mapping fields…";
  setWarning(null);
  try {
    // paywall indicator (best-effort)
    if (billingStatus?.plan === "free" && (billingStatus?.free_quota_remaining ?? 0) <= 0) {
      void trackExtensionEvent("paywall_hit", { surface: "extension_suggest" });
    }
    if (billingStatus?.plan === "free" && (billingStatus?.free_quota_remaining ?? 0) <= 0) {
      out.textContent = "Upgrade required: free plan monthly limit reached. Open pricing page to upgrade.";
      chrome.tabs.create({ url: `${stripTrailingSlash(appOrigin ?? "http://localhost:3000")}/pricing` });
      return;
    }
    const mappedRes = await apiFetch<{ mapped: any[] }>("/api/extension/forms/map-fields", {
      method: "POST",
      body: JSON.stringify({
        fields: scan.fields.map((f) => ({
          field_id: f.id,
          name: f.name,
          label: f.label,
          field_type: f.type,
          required: f.required,
          autocomplete: f.autocomplete,
          placeholder: (f as any).placeholder ?? null,
          aria_label: (f as any).aria_label ?? null,
          data_automation_id: (f as any).data_automation_id ?? null,
          form: (f as any).form ?? null,
        }))
      })
    });
    mapped = mappedRes.mapped;
    const unsupported = mapped.filter((m) => !m.mapped_key || (m.confidence ?? 0) < 0.6).length;
    const sensitive = mapped.filter((m) => m.needs_user_approval).length;
    if (unsupported > 0) {
      setWarning(
        `Some fields could not be mapped confidently (${unsupported}). Those will stay blank and require your review.`
      );
    } else if (sensitive > 0) {
      setWarning(`Sensitive fields detected (${sensitive}). They will not be auto-filled.`);
    }

    out.textContent = "Suggesting answers (approved facts only)…";
    const suggestRes = await apiFetch<{ suggested: any[]; cover_letter_markdown?: string }>(
      "/api/extension/forms/suggest-answers",
      {
        method: "POST",
        body: JSON.stringify({
          job_url: scan.jobMeta.jobUrl,
          job_description: "",
          mapped
        })
      }
    );
    suggested = suggestRes.suggested;
    coverLetter.value = suggestRes.cover_letter_markdown ?? "";
    answersOut.textContent = JSON.stringify(suggested, null, 2);
  } catch (e) {
    out.textContent = handleError(e);
  } finally {
    await refreshAuthState();
  }
});

fillBtn.addEventListener("click", async () => {
  // Hard constraint: no auto-submit. Fill only sets values.
  setWarning(null);
  if (billingStatus?.plan === "free" && (billingStatus?.free_quota_remaining ?? 0) <= 0) {
    out.textContent = "Upgrade required to use autofill.";
    chrome.tabs.create({ url: `${stripTrailingSlash(appOrigin ?? "http://localhost:3000")}/pricing` });
    void trackExtensionEvent("paywall_hit", { surface: "extension_fill" });
    return;
  }
  const attempted = suggested.filter((s) => s.value && !s.needs_user_approval).length;
  void trackExtensionEvent("autofill_started", { attempted, adapter: scan?.adapter ?? null });
  const fillItems = suggested
    .filter((s) => s.value && !s.needs_user_approval)
    .map((s) => ({ fieldId: s.field_id, value: s.value as string }));

  out.textContent = `Filling ${fillItems.length} approved fields…`;
  try {
    const res = await sendToActiveTab({ type: "jaa.fill", payload: { items: fillItems } });
    out.textContent = JSON.stringify(res, null, 2);
    const filled = Number(res?.filled ?? 0);
    const warningsCount = Array.isArray(res?.warnings) ? res.warnings.length : 0;
    if (warningsCount > 0 || filled < attempted) {
      setWarning(`Some fields could not be filled (${filled}/${attempted}). Review the form before submitting.`);
      void trackExtensionEvent("autofill_failed", { attempted, filled, warnings_count: warningsCount, adapter: scan?.adapter ?? null });
    }
    void trackExtensionEvent("autofill_completed", { attempted, filled, warnings_count: warningsCount, adapter: scan?.adapter ?? null });
    if (applicationId) {
      await apiFetch("/api/extension/applications/record", {
        method: "POST",
        body: JSON.stringify({
          application_id: applicationId,
          status: "in_progress",
          submitted_by_extension: false,
          review_packet: { suggested, cover_letter_markdown: coverLetter.value, job_meta: scan?.jobMeta }
        })
      });
      void trackExtensionEvent("application_recorded", { applicationId });
    }
  } catch (e) {
    out.textContent = handleError(e);
    void trackExtensionEvent("autofill_failed", { attempted, filled: 0, warnings_count: 0, adapter: scan?.adapter ?? null });
  } finally {
    await refreshAuthState();
  }
});

recordBtn.addEventListener("click", async () => {
  if (!applicationId) return;
  out.textContent = "Recording…";
  setWarning(null);
  try {
    await apiFetch("/api/extension/applications/record", {
      method: "POST",
      body: JSON.stringify({
        application_id: applicationId,
        status: "ready_for_review",
        submitted_by_extension: false,
        review_packet: { suggested, cover_letter_markdown: coverLetter.value, job_meta: scan?.jobMeta }
      })
    });
    out.textContent = "Recorded.";
    void trackExtensionEvent("application_recorded", { applicationId });
  } catch (e) {
    out.textContent = handleError(e);
  }
});

exportBtn.addEventListener("click", async () => {
  out.textContent = "Downloading XLSX…";
  setWarning(null);
  try {
    if (billingStatus?.plan === "free" && (billingStatus?.free_quota_remaining ?? 0) <= 0) {
      out.textContent = "Upgrade required to export tracker.";
      chrome.tabs.create({ url: `${stripTrailingSlash(appOrigin ?? "http://localhost:3000")}/pricing` });
      void trackExtensionEvent("paywall_hit", { surface: "extension_export_xlsx" });
      return;
    }
    await downloadXlsx();
    out.textContent = "Download started.";
    void trackExtensionEvent("excel_exported", {});
  } catch (e) {
    out.textContent = handleError(e);
  }
});

(async () => {
  reportIssueBtn.addEventListener("click", async () => {
    const pageUrl = scan?.jobMeta?.jobUrl ?? (await chrome.tabs.query({ active: true, currentWindow: true }))[0]?.url ?? "";
    const adapter = scan?.adapter ?? "unknown";
    const message = prompt(
      "Describe the issue (do not include sensitive personal data). We'll attach the page URL and adapter name for debugging."
    );
    if (!message) return;
    try {
      const API_BASE = await getApiBase();
      await fetch(`${API_BASE}/api/telemetry/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: null,
          category: "extension_issue",
          message: `URL: ${pageUrl}\nAdapter: ${adapter}\n\n${message}\n\nLast error: ${lastError ?? "(none)"}`,
          rating: null,
          source_page: pageUrl
        })
      });
      out.textContent = "Thanks. Issue report sent.";
    } catch (e) {
      out.textContent = handleError(e);
    }
  });
})();

(async () => {
  await initApiBase();
  await refreshPublicConfig();
  await refreshAuthState();
  void trackExtensionEvent("extension_opened", { surface: "sidepanel_init" });
})();
