"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";
import { useRequireAuth } from "../lib/auth";

export default function AdminHomeClient() {
  const { loading } = useRequireAuth();
  const [summary, setSummary] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setSummary(await apiFetch("/api/admin/analytics/summary"));
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unknown error");
      }
    })();
  }, []);

  return (
    <div className="container">
      {loading ? <div className="card" style={{ marginTop: 14 }}>Loading…</div> : null}
      <div className="nav">
        <div className="brand">
          <Link href="/">Job Application Assistant</Link>
          <span className="badge">Admin</span>
        </div>
        <div className="row">
          <Link href="/admin/analytics">Analytics</Link>
          <Link href="/admin/feedback">Feedback</Link>
          <Link href="/admin/waitlist">Waitlist</Link>
          <Link href="/admin/support">Support</Link>
          <Link href="/dashboard">Dashboard</Link>
        </div>
      </div>
      <h1 className="h1">Beta Admin</h1>
      <p className="muted">Requires `ADMIN_EMAILS` on the API and a token in the dashboard.</p>
      {error ? <div className="notice danger">{error}</div> : null}
      <div className="card" style={{ marginTop: 14 }}>
        <h2>Summary</h2>
        <pre style={{ whiteSpace: "pre-wrap" }}>{summary ? JSON.stringify(summary, null, 2) : "Loading..."}</pre>
      </div>
    </div>
  );
}
