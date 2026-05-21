export const runtime = "nodejs";

export async function POST(req: Request) {
  // Public beta waitlist capture.
  // Guardrail: do not log PII server-side; only forward to the configured backend.
  try {
    const body = (await req.json().catch(() => null)) as
      | { email?: unknown; role?: unknown; job_search_status?: unknown; source?: unknown }
      | null;

    const email = typeof body?.email === "string" ? body.email.trim() : "";
    const role = typeof body?.role === "string" ? body.role.trim() : undefined;
    const job_search_status = typeof body?.job_search_status === "string" ? body.job_search_status.trim() : undefined;
    const source = typeof body?.source === "string" ? body.source.trim() : "web";

    if (!email || !email.includes("@")) return new Response("Invalid email", { status: 400 });

    const apiBase = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000";
    const res = await fetch(`${apiBase}/api/waitlist`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, role, job_search_status, source })
    });

    if (!res.ok) {
      const text = await res.text();
      return new Response(text || "Upstream error", { status: 502 });
    }
    return new Response(null, { status: 204 });
  } catch {
    return new Response("Bad request", { status: 400 });
  }
}

