"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState } from "react";
import { apiFetch, setToken } from "../lib/api";
import { track } from "../../lib/analytics";
import { AuthShell } from "../../components/auth/AuthShell";
import Link from "next/link";

function LoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") ?? "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setStatus("loading");
    setError(null);
    try {
      const res = await apiFetch<{ access_token: string }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password })
      });
      setToken(res.access_token);
      await track("signup_completed", { surface: "web_login" });
      router.replace(next);
    } catch (e) {
      setStatus("error");
      setError(e instanceof Error ? e.message : "Login failed");
    } finally {
      setStatus("idle");
    }
  }

  return (
    <AuthShell
      titleBadge="Login"
      title="Welcome back"
      subtitle="Sign in to continue your Hirely workspace."
    >
      <h1 className="h1" style={{ marginTop: 0 }}>
        Sign in
      </h1>
      <p className="muted">Continue with your existing account.</p>

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
          autoComplete="current-password"
        />
      </div>

      {error ? <div className="notice danger">{error}</div> : null}

      <div className="row" style={{ marginTop: 10 }}>
        <button className="btn btnPrimary" onClick={submit} disabled={!email || !password || status === "loading"}>
          {status === "loading" ? "Signing in…" : "Sign in"}
        </button>
        <Link className="btn" href={`/signup${next ? `?next=${encodeURIComponent(next)}` : ""}`}>
          Create account
        </Link>
      </div>
    </AuthShell>
  );
}

export default function LoginClient() {
  // useSearchParams requires Suspense in this Next version
  return (
    <Suspense fallback={<div className="container"><div className="card" style={{ marginTop: 14 }}>Loading…</div></div>}>
      <LoginInner />
    </Suspense>
  );
}
