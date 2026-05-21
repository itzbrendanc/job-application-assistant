"use client";

import { useState } from "react";

export default function ContactClient() {
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setStatus("loading");
    setError(null);
    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, subject, message })
      });
      if (!res.ok) throw new Error(await res.text());
      setStatus("ok");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch (e) {
      setStatus("error");
      setError(e instanceof Error ? e.message : "Could not submit");
    }
  }

  return (
    <section className="mkSection" style={{ paddingTop: 26 }}>
      <div className="mkCard">
        <h1 className="mkH1" style={{ margin: 0 }}>
          Contact
        </h1>
        <p className="mkLead" style={{ marginTop: 10 }}>
          Beta support, questions, or policy concerns. We’ll get back to you as quickly as we can.
        </p>

        <div className="mkMuted" style={{ marginTop: 10 }}>
          Prefer email? <a href="mailto:support@example.com">support@example.com</a>
        </div>

        <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
          <label className="mkMuted">
            Email
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@domain.com"
              inputMode="email"
              autoComplete="email"
              style={{ width: "100%", marginTop: 6 }}
            />
          </label>
          <label className="mkMuted">
            Subject
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="What can we help with?"
              style={{ width: "100%", marginTop: 6 }}
            />
          </label>
          <label className="mkMuted">
            Message
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe what happened and what you expected."
              rows={6}
              style={{ width: "100%", marginTop: 6 }}
            />
          </label>

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button
              className="mkBtn mkBtnPrimary"
              type="button"
              onClick={submit}
              disabled={!email || !subject || !message || status === "loading"}
            >
              {status === "loading" ? "Sending…" : "Send message"}
            </button>
            <div className="mkMuted">Typical response time: 1–2 business days during beta.</div>
          </div>
        </div>

        {status === "ok" ? <div className="mkOk" style={{ marginTop: 10 }}>Thanks. We received your message.</div> : null}
        {status === "error" ? <div className="mkWarn" style={{ marginTop: 10 }}>{error ?? "Couldn’t submit right now. Try again."}</div> : null}
      </div>
    </section>
  );
}

