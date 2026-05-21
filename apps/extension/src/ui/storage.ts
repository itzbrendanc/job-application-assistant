const TOKEN_KEY = "jaa_token";
const ANON_KEY = "jaa_anon_id";

export async function getToken(): Promise<string | null> {
  const res = await chrome.storage.session.get([TOKEN_KEY]);
  return (res[TOKEN_KEY] as string) ?? null;
}

export async function setToken(token: string): Promise<void> {
  await chrome.storage.session.set({ [TOKEN_KEY]: token });
}

export async function clearToken(): Promise<void> {
  await chrome.storage.session.remove([TOKEN_KEY]);
}

export async function getOrCreateAnonId(): Promise<string> {
  const res = await chrome.storage.sync.get([ANON_KEY]);
  const existing = res[ANON_KEY] as string | undefined;
  if (existing) return existing;
  const id = crypto?.randomUUID ? crypto.randomUUID() : String(Math.random()).slice(2);
  await chrome.storage.sync.set({ [ANON_KEY]: id });
  return id;
}
