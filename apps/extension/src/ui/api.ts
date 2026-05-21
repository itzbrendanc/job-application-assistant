import { clearToken, getOrCreateAnonId, getToken } from "./storage";
import { getApiBase } from "./config";

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const API_BASE = await getApiBase();
  const token = await getToken();
  const headers = new Headers(init.headers);
  if (!(init.body instanceof FormData)) {
    headers.set("Content-Type", headers.get("Content-Type") ?? "application/json");
  }
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${API_BASE}${path}`, { ...init, headers });
  if (!res.ok) {
    if (res.status === 401) {
      await clearToken();
    }
    const text = await res.text();
    throw new Error(`${res.status}: ${text}`);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export async function publicFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const API_BASE = await getApiBase();
  const headers = new Headers(init.headers);
  if (!(init.body instanceof FormData)) {
    headers.set("Content-Type", headers.get("Content-Type") ?? "application/json");
  }
  const res = await fetch(`${API_BASE}${path}`, { ...init, headers });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status}: ${text}`);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export async function downloadXlsx(): Promise<void> {
  const API_BASE = await getApiBase();
  const token = await getToken();
  const res = await fetch(`${API_BASE}/api/applications/export/xlsx`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined
  });
  if (!res.ok) throw new Error(await res.text());
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  chrome.downloads.download({ url, filename: `job_applications.xlsx`, saveAs: true });
}

export async function trackExtensionEvent(
  event_name: string,
  properties: Record<string, unknown> = {}
): Promise<void> {
  try {
    const API_BASE = await getApiBase();
    const token = await getToken();
    const anonymous_id = await getOrCreateAnonId();
    await fetch(`${API_BASE}/api/telemetry/analytics`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ event_name, anonymous_id, properties, source: "extension" })
    });
  } catch {
    // never block UX
  }
}
