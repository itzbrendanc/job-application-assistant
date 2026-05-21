export const runtime = "nodejs";

export async function POST(req: Request) {
  // Public support intake for beta. Stored by the backend for admin review.
  // Guardrail: do not log message content.
  try {
    const body = (await req.json().catch(() => null)) as
      | { email?: unknown; subject?: unknown; message?: unknown }
      | null;
    const email = typeof body?.email === "string" ? body.email.trim() : "";
    const subject = typeof body?.subject === "string" ? body.subject.trim() : "";
    const message = typeof body?.message === "string" ? body.message.trim() : "";

    if (!email || !email.includes("@")) return new Response("Invalid email", { status: 400 });
    if (subject.length < 3) return new Response("Subject too short", { status: 400 });
    if (message.length < 5) return new Response("Message too short", { status: 400 });

    const apiBase = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000";
    const res = await fetch(`${apiBase}/api/support`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, subject, message })
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

