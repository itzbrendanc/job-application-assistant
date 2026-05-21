"use client";

import { useState } from "react";
import { Footer } from "../../components/marketing/Footer";
import { MarketingNavbar } from "../../components/marketing/MarketingNavbar";
import { track } from "../../lib/analytics";

export default function FeedbackClient() {
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");

  async function submit() {
    setStatus("loading");
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, message })
      });
      if (!res.ok) throw new Error("bad");
      setMessage("");
      setEmail("");
      setStatus("ok");
      await track("application_recorded", { surface: "web_feedback_submitted" });
    } catch {
      setStatus("error");
    }
  }

  return (
    <>
      <MarketingNavbar />
      <main>
        <section className="mkSection" style={{ paddingTop: 26 }}>
          <div className="mkCard">
            <h1 className="mkH1" style={{ margin: 0 }}>
              Beta feedback
            </h1>
            <p className="mkLead" style={{ marginTop: 10 }}>
              Tell us what felt confusing, unsafe, or slow. Short and specific helps.
            </p>
            <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email (optional)"
                inputMode="email"
                autoComplete="email"
              />
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="What should we improve?"
                rows={8}
                style={{
                  width: "100%",
                  padding: 12,
                  borderRadius: 14,
                  border: "1px solid rgba(255,255,255,0.14)",
                  background: "rgba(0,0,0,0.25)",
                  color: "var(--text)"
                }}
              />
              <button
                className="mkBtn mkBtnPrimary mkBtnLg"
                type="button"
                onClick={submit}
                disabled={!message || status === "loading"}
              >
                {status === "loading" ? "Sending…" : "Send feedback"}
              </button>
              {status === "ok" ? <div className="mkOk">Thanks — feedback received.</div> : null}
              {status === "error" ? <div className="mkWarn">Couldn’t send right now. Try again.</div> : null}
              <div className="mkMuted">Note: feedback storage is stubbed unless configured (see README).</div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

