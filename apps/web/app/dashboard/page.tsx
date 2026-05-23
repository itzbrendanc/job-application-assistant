"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiFetch, clearToken, getToken } from "../lib/api";
import { useRouter } from "next/navigation";

type Me = { id: string; email: string };

export default function DashboardPage() {
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadMe() {
    setError(null);
    try {
      const data = await apiFetch<Me>("/api/auth/me");
      setMe(data);
    } catch (e) {
      setMe(null);
      setError(e instanceof Error ? e.message : "Unknown error");
    }
  }

  useEffect(() => {
    (async () => {
      if (getToken()) await loadMe();
      else router.replace("/login?next=%2Fdashboard");
      setLoading(false);
    })();
  }, []);

  return (
    <div className="container">
      <div className="nav">
        <div className="brand">
          <Link href="/">Hirely</Link>
          <span className="badge">Dashboard</span>
        </div>
        <div className="row">
          <Link href="/onboarding">Onboarding</Link>
          <Link href="/job-sites">Job Sites</Link>
          <Link href="/jobs">Jobs</Link>
          <Link href="/applications">Applications</Link>
          <Link href="/settings">Settings</Link>
        </div>
      </div>

      <h1 className="h1">Dashboard</h1>
      <p className="muted">Signed-in workspace for onboarding, tracking, and billing.</p>

      <div className="grid">
        <div className="card">
          <h2>Session</h2>
          <div className="row">
            <button
              className="btn"
              onClick={async () => {
                await loadMe();
              }}
            >
              Refresh
            </button>
            <button
              className="btn btnDanger"
              onClick={() => {
                clearToken();
                setMe(null);
                router.replace("/login");
              }}
            >
              Sign out
            </button>
          </div>
          {error ? <p className="muted">{error}</p> : null}
          {me ? (
            <div className="notice" style={{ marginTop: 12 }}>
              Signed in as <b>{me.email}</b>
            </div>
          ) : (
            <div className={loading ? "notice" : "notice danger"} style={{ marginTop: 12 }}>
              {loading ? "Loading session…" : "Not signed in."}
            </div>
          )}
        </div>

        <div className="card">
          <h2>Next actions</h2>
          <div className="row">
            <Link className="btn" href="/onboarding">
              Upload resume
            </Link>
            <Link className="btn" href="/jobs">
              Import a job
            </Link>
            <Link className="btn" href="/applications">
              Track applications
            </Link>
          </div>
          <p className="muted" style={{ marginTop: 12 }}>
            Hard constraints are enforced in the API: no auto-submission, sensitive questions require approval, and
            AI generation is limited to user-approved facts.
          </p>
        </div>
      </div>
    </div>
  );
}
