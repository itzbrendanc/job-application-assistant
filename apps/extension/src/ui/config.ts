const API_BASE_KEY = "jaa_api_base";

export async function getApiBase(): Promise<string> {
  const res = await chrome.storage.sync.get([API_BASE_KEY]);
  const val = res[API_BASE_KEY];
  if (typeof val === "string" && val.startsWith("http")) return val.replace(/\/+$/, "");
  return "http://localhost:8000";
}

export async function setApiBase(base: string): Promise<void> {
  const normalized = base.trim().replace(/\/+$/, "");
  await chrome.storage.sync.set({ [API_BASE_KEY]: normalized });
}

