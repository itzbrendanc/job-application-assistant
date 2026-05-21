function normalizeApiBase(raw: string): string {
  const trimmed = (raw || "").trim().replace(/\/+$/, "");
  // Common misconfig: setting NEXT_PUBLIC_API_BASE to ".../api" causes "/api/api/..." 404s.
  if (trimmed.endsWith("/api")) return trimmed.slice(0, -4);
  return trimmed;
}

export const API_BASE = normalizeApiBase(process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000");

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("jaa_token");
}

export function setToken(token: string) {
  window.localStorage.setItem("jaa_token", token);
}

export function clearToken() {
  window.localStorage.removeItem("jaa_token");
}

export async function publicFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", headers.get("Content-Type") ?? "application/json");
  const res = await fetch(`${API_BASE}${path}`, { ...init, headers, cache: "no-store" });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${res.status}: ${text}`);
  }
  return (await res.json()) as T;
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers = new Headers(init.headers);
  headers.set("Content-Type", headers.get("Content-Type") ?? "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, { ...init, headers, cache: "no-store" });
  } catch (e) {
    // Network/DNS/CORS failures often surface here with a generic TypeError in browsers.
    throw new Error(
      `Network error calling API at ${API_BASE}${path}. Check NEXT_PUBLIC_API_BASE and CORS.`
    );
  }
  if (!res.ok) {
    if (res.status === 401) {
      // Expired/invalid session: clear local token so the UI can recover cleanly.
      clearToken();
    }
    const text = await res.text();
    throw new Error(`API ${res.status} from ${API_BASE}${path}: ${text}`);
  }
  return (await res.json()) as T;
}
