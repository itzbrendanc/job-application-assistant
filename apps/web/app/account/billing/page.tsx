"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiFetch } from "../../lib/api";
import { useRequireAuth } from "../../lib/auth";

export default function BillingPage() {
  const { loading } = useRequireAuth();
  const [status, setStatus] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    setError(null);
    try {
      setStatus(await apiFetch("/api/billing/status"));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  async function upgrade(plan: "pro_monthly" | "pro_annual") {
    setError(null);
    try {
      const res = await apiFetch<{ url: string }>("/api/billing/checkout", {
        method: "POST",
        body: JSON.stringify({ plan })
      });
      window.location.href = res.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    }
  }

  async function manage() {
    setError(null);
    try {
      const res = await apiFetch<{ url: string }>("/api/billing/portal", {
        method: "POST",
        body: JSON.stringify({ return_url: window.location.origin + "/account/billing" })
      });
      window.location.href = res.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    }
  }

  return (
    <div className="container">
      {loading ? <div className="card" style={{ marginTop: 14 }}>Loading…</div> : null}
      <div className="nav">
        <div className="brand">
          <Link href="/">Job Application Assistant</Link>
          <span className="badge">Billing</span>
        </div>
        <div className="row">
          <Link href="/pricing">Pricing</Link>
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/download">Download</Link>
        </div>
      </div>

      <h1 className="h1">Billing</h1>
      <p className="muted">Stripe Checkout + Billing. No custom card storage.</p>
      {error ? <p className="muted">{error}</p> : null}

      <div className="grid">
        <div className="card">
          <h2>Status</h2>
          <pre style={{ whiteSpace: "pre-wrap" }}>{status ? JSON.stringify(status, null, 2) : "Loading..."}</pre>
          <div className="row">
            <button className="btn" onClick={refresh}>
              Refresh
            </button>
            <button className="btn" onClick={manage} disabled={!status}>
              Manage subscription
            </button>
          </div>
        </div>
        <div className="card">
          <h2>Upgrade</h2>
          <div className="notice">
            Free plan includes 10 tracked applications/month. Pro unlocks unlimited tracker + extension autofill +
            cover letters.
          </div>
          <div className="row" style={{ marginTop: 10 }}>
            <button className="btn btnPrimary" onClick={() => upgrade("pro_monthly")}>
              Upgrade monthly
            </button>
            <button className="btn btnPrimary" onClick={() => upgrade("pro_annual")}>
              Upgrade annual
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
