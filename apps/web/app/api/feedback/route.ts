export const runtime = "nodejs";

function normalizeApiBase(raw: string): string {
  const trimmed = (raw || "").trim().replace(/\/+$/, "");
  if (trimmed.endsWith("/api")) return trimmed.slice(0, -4);
  return trimmed;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => null)) as { email?: unknown; message?: unknown } | null;
    const message = typeof body?.message === "string" ? body.message.trim() : "";
    if (!message) return new Response("Message required", { status: 400 });
    const apiBase = normalizeApiBase(process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000");
    await fetch(`${apiBase}/api/telemetry/feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: typeof body?.email === "string" ? body?.email : null,
        category: "beta",
        message,
        rating: null,
        source_page: "/feedback"
      })
    }).catch(() => null);
    return new Response(null, { status: 204 });
  } catch {
    return new Response("Bad request", { status: 400 });
  }
}
