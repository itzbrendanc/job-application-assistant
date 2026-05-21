"use client";

import Link from "next/link";
import { useState } from "react";

export function CTASection() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");

  async function submit() {
    setStatus("loading");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "marketing_cta" })
      });
      if (!res.ok) throw new Error("bad");
      setEmail("");
      setStatus("ok");
    } catch {
      setStatus("error");
    }
  }

  return (
    <section className="mkCTA">
      <div className="mkCTAInner">
        <div>
          <h2 className="mkH2">Apply faster. Stay credible.</h2>
          <p className="mkMuted">
            Start free, then upgrade when you want unlimited tracking and extension-powered autofill.
          </p>
          <div className="mkHeroCtas" style={{ marginTop: 12 }}>
            <Link className="mkBtn mkBtnPrimary mkBtnLg" href="/signup">
              Start free
            </Link>
            <Link className="mkBtn mkBtnGhost mkBtnLg" href="/pricing">
              Upgrade to Pro
            </Link>
          </div>
        </div>
        <div className="mkLeadCard" aria-label="Join beta">
          <div className="mkLeadTitle">Join the beta</div>
          <div className="mkMuted" style={{ marginTop: 6 }}>
            Get early access updates and release notes. No spam.
          </div>
          <div className="mkLeadForm">
            <label className="mkSrOnly" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@domain.com"
              inputMode="email"
              autoComplete="email"
            />
            <button className="mkBtn mkBtnPrimary" type="button" onClick={submit} disabled={!email || status === "loading"}>
              {status === "loading" ? "Joining…" : "Join beta"}
            </button>
          </div>
          {status === "ok" ? <div className="mkOk">Thanks, you’re on the list.</div> : null}
          {status === "error" ? <div className="mkWarn">Couldn’t submit right now. Try again.</div> : null}
        </div>
      </div>
    </section>
  );
}
