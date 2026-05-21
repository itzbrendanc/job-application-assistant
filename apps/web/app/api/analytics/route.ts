export const runtime = "nodejs";

function normalizeApiBase(raw: string): string {
  const trimmed = (raw || "").trim().replace(/\/+$/, "");
  if (trimmed.endsWith("/api")) return trimmed.slice(0, -4);
  return trimmed;
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body.name !== "string") return new Response("Bad request", { status: 400 });
    const apiBase = normalizeApiBase(process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000");

    // Persist to backend (beta DB), but never block UX.
    await fetch(`${apiBase}/api/telemetry/analytics`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event_name: body.name,
        anonymous_id: body.anonymousId ?? null,
        properties: body.props ?? {},
        source: body.source ?? "web"
      })
    }).catch(() => null);

    return new Response(null, { status: 204 });
  } catch {
    return new Response("Bad request", { status: 400 });
  }
}
