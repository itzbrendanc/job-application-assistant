"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { apiFetch, publicFetch, setToken } from "../lib/api";
import { track } from "../../lib/analytics";
import { AuthShell } from "../../components/auth/AuthShell";

type PublicConfig = { beta_invite_only: boolean };

function SignupInner() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") ?? "/dashboard";

  const [cfg, setCfg] = useState<PublicConfig | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [status, setStatus] = useState<"idle" | "loading">("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setCfg(await publicFetch<PublicConfig>("/api/public/config"));
      } catch {
        setCfg({ beta_invite_only: false });
      }
    })();
  }, []);

  async function submit() {
    setStatus("loading");
    setError(null);
    try {
      await track("signup_started", { surface: "web_signup" });
      const res = await apiFetch<{ access_token: string }>("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify({
          email,
          password,
          invite_code: (cfg?.beta_invite_only ? inviteCode : inviteCode || undefined) ?? undefined
        })
      });
      setToken(res.access_token);
      await track("signup_completed", { surface: "web_signup" });
      router.replace(next);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Signup failed";
      setError(msg);
      // If invite-only is enabled but config fetch failed, showing the field on error helps.
      if (msg.includes("Invite code required")) setCfg({ beta_invite_only: true });
    } finally {
      setStatus("idle");
    }
  }

  return (
    <AuthShell
      titleBadge="Sign up"
      title="Start applying smarter"
      subtitle="Create an account to unlock the extension workflow and dashboard tracker."
    >
      <h1 className="h1" style={{ marginTop: 0 }}>
        Create your account
      </h1>
      <p className="muted">Review-first autofill, user-controlled submission, and audited tracking.</p>

      <div className="field">
        <label>Email</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} inputMode="email" autoComplete="email" />
      </div>
      <div className="field">
        <label>Password</label>
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          autoComplete="new-password"
        />
        <div className="muted">Minimum 8 characters.</div>
      </div>

      {cfg?.beta_invite_only ? (
        <div className="field">
          <label>Invite code</label>
          <input value={inviteCode} onChange={(e) => setInviteCode(e.target.value)} placeholder="Required for beta access" />
          <div className="muted">Invite-only beta is enabled.</div>
        </div>
      ) : null}

      {error ? <div className="notice danger">{error}</div> : null}

      <div className="row" style={{ marginTop: 10 }}>
        <button
          className="btn btnPrimary"
          onClick={submit}
          disabled={!email || !password || status === "loading" || (cfg?.beta_invite_only && !inviteCode)}
        >
          {status === "loading" ? "Creating…" : "Create account"}
        </button>
        <Link className="btn" href={`/login${next ? `?next=${encodeURIComponent(next)}` : ""}`}>
          Sign in
        </Link>
      </div>
    </AuthShell>
  );
}

export default function SignupClient() {
  return (
    <Suspense fallback={<div className="container"><div className="card" style={{ marginTop: 14 }}>Loading…</div></div>}>
      <SignupInner />
    </Suspense>
  );
}
