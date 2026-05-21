const API_BASE_KEY = "jaa_api_base";

function normalizeApiBase(raw: string): string {
  const trimmed = (raw || "").trim().replace(/\/+$/, "");
  // Common misconfig: setting API base to ".../api" causes "/api/api/..." 404s.
  if (trimmed.endsWith("/api")) return trimmed.slice(0, -4);
  return trimmed;
}

export async function getApiBase(): Promise<string> {
  const res = await chrome.storage.sync.get([API_BASE_KEY]);
  const val = res[API_BASE_KEY];
  if (typeof val === "string" && val.startsWith("http")) return normalizeApiBase(val);
  return normalizeApiBase("http://localhost:8000");
}

export async function setApiBase(base: string): Promise<void> {
  const normalized = normalizeApiBase(base);
  await chrome.storage.sync.set({ [API_BASE_KEY]: normalized });
}
