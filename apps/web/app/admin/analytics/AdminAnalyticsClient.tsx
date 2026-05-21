"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiFetch } from "../../lib/api";
import { useRequireAuth } from "../../lib/auth";

function Card({ label, value }: { label: string; value: number }) {
  return (
    <div className="card">
      <div className="muted">{label}</div>
      <div style={{ fontSize: 28, fontWeight: 800, marginTop: 6 }}>{value}</div>
    </div>
  );
}

function RateCard({ label, value }: { label: string; value: number }) {
  const pct = Number.isFinite(value) ? Math.round(value * 100) : 0;
  return (
    <div className="card">
      <div className="muted">{label}</div>
      <div style={{ fontSize: 28, fontWeight: 800, marginTop: 6 }}>{pct}%</div>
    </div>
  );
}

export default function AdminAnalyticsClient() {
  const { loading } = useRequireAuth();
  const [summary, setSummary] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    setError(null);
    try {
      const s = await apiFetch("/api/admin/analytics/summary");
      setSummary(s);
      const ev = await apiFetch<any[]>("/api/admin/analytics/events?limit=50");
      setEvents(ev);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  return (
    <div className="container">
      {loading ? <div className="card" style={{ marginTop: 14 }}>Loading…</div> : null}
      <div className="nav">
        <div className="brand">
          <Link href="/admin">Admin</Link>
          <span className="badge">Analytics</span>
        </div>
        <div className="row">
          <Link href="/admin/feedback">Feedback</Link>
          <Link href="/admin/waitlist">Waitlist</Link>
          <Link href="/admin/support">Support</Link>
          <button className="btn" onClick={refresh}>
            Refresh
          </button>
        </div>
      </div>

      <h1 className="h1">Analytics</h1>
      {error ? <div className="notice danger">{error}</div> : null}

      {summary ? (
        <div className="grid" style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
          <Card label="Signups" value={summary.total_signups} />
          <Card label="Checkout started" value={summary.checkout_started} />
          <Card label="Subscription active" value={summary.subscription_active} />
          <Card label="Extension opened" value={summary.extension_opened} />
          <Card label="Extension logged in" value={summary.extension_logged_in} />
          <Card label="Job detected" value={summary.job_detected} />
          <Card label="Autofill started" value={summary.autofill_started} />
          <Card label="Autofill completed" value={summary.autofill_completed} />
          <Card label="Autofill failed" value={summary.autofill_failed} />
          <RateCard label="Autofill success rate" value={summary.autofill_success_rate} />
          <RateCard label="Autofill failure rate" value={summary.autofill_failure_rate} />
          <Card label="Applications recorded" value={summary.application_recorded} />
          <Card label="Excel exported" value={summary.excel_exported} />
          <Card label="Paywall hits" value={summary.paywall_hit} />
        </div>
      ) : (
        <div className="card">Loading…</div>
      )}

      {summary?.applications_recorded_by_day?.length ? (
        <div className="card" style={{ marginTop: 14 }}>
          <h2>Applications recorded (last 7 days)</h2>
          <div style={{ display: "grid", gap: 6 }}>
            {summary.applications_recorded_by_day.map((r: any) => (
              <div key={r.date} className="row" style={{ justifyContent: "space-between" }}>
                <span className="muted">{r.date}</span>
                <b>{r.count}</b>
              </div>
            ))}
          </div>
          <div className="muted" style={{ marginTop: 8 }}>
            Conversions (directional):
            <div>Signup → extension open: {Math.round((summary.signup_to_extension_conversion ?? 0) * 100)}%</div>
            <div>Extension open → first application: {Math.round((summary.extension_to_first_application_conversion ?? 0) * 100)}%</div>
          </div>
        </div>
      ) : null}

      <div className="card" style={{ marginTop: 14 }}>
        <h2>Recent events</h2>
        {events.length === 0 ? (
          <p className="muted">No events yet.</p>
        ) : (
          <div style={{ display: "grid", gap: 8 }}>
            {events.map((e) => (
              <div key={e.id} className="notice">
                <div className="row" style={{ justifyContent: "space-between" }}>
                  <b>{e.event_name}</b>
                  <span className="muted">{e.source}</span>
                </div>
                <div className="muted">{e.created_at}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
