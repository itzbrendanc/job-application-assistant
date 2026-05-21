export const runtime = "nodejs";

function normalizeApiBase(raw: string): string {
  const trimmed = (raw || "").trim().replace(/\/+$/, "");
  if (trimmed.endsWith("/api")) return trimmed.slice(0, -4);
  return trimmed;
}

export async function POST(req: Request) {
  // Back-compat alias: forward old lead capture to the waitlist endpoint.
  try {
    const body = (await req.json().catch(() => null)) as { email?: unknown } | null;
    const email = typeof body?.email === "string" ? body.email.trim() : "";
    if (!email || !email.includes("@")) {
      return new Response("Invalid email", { status: 400 });
    }
    const apiBase = normalizeApiBase(process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000");
    await fetch(`${apiBase}/api/waitlist`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, source: "web_leads_alias" })
    }).catch(() => null);
    return new Response(null, { status: 204 });
  } catch {
    return new Response("Bad request", { status: 400 });
  }
}
