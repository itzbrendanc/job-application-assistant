"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../../lib/api";
import { useRequireAuth } from "../../lib/auth";

type SupportRow = {
  id: string;
  email: string;
  subject: string;
  message: string;
  status: "open" | "reviewed" | "closed";
  internal_note: string | null;
  created_at: string;
};

export default function AdminSupportClient() {
  const { loading } = useRequireAuth();
  const [rows, setRows] = useState<SupportRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "loading">("idle");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [q, setQ] = useState("");

  async function refresh() {
    setStatus("loading");
    setError(null);
    try {
      const qs = new URLSearchParams();
      if (filterStatus) qs.set("status", filterStatus);
      if (q.trim()) qs.set("q", q.trim());
      const data = await apiFetch<SupportRow[]>(`/api/admin/support?${qs.toString()}`);
      setRows(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setStatus("idle");
    }
  }

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const counts = useMemo(() => {
    const c = { open: 0, reviewed: 0, closed: 0 };
    for (const r of rows) c[r.status] += 1;
    return c;
  }, [rows]);

  async function patch(id: string, patchBody: Partial<Pick<SupportRow, "status" | "internal_note">>) {
    try {
      await apiFetch(`/api/admin/support/${id}`, { method: "PATCH", body: JSON.stringify(patchBody) });
      await refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to update");
    }
  }

  return (
    <div className="container">
      {loading ? <div className="card" style={{ marginTop: 14 }}>Loading…</div> : null}
      <div className="nav">
        <div className="brand">
          <Link href="/admin">Admin</Link>
          <span className="badge">Support</span>
        </div>
        <div className="row">
          <Link href="/admin/analytics">Analytics</Link>
          <Link href="/admin/feedback">Feedback</Link>
          <Link href="/admin/waitlist">Waitlist</Link>
          <button className="btn" onClick={refresh} disabled={status === "loading"}>
            {status === "loading" ? "Refreshing…" : "Refresh"}
          </button>
        </div>
      </div>

      <h1 className="h1">Support</h1>
      {error ? <div className="notice danger">{error}</div> : null}

      <div className="grid" style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))", marginTop: 14 }}>
        <div className="card">
          <div className="muted">Open</div>
          <div style={{ fontSize: 28, fontWeight: 800, marginTop: 6 }}>{counts.open}</div>
        </div>
        <div className="card">
          <div className="muted">Reviewed</div>
          <div style={{ fontSize: 28, fontWeight: 800, marginTop: 6 }}>{counts.reviewed}</div>
        </div>
        <div className="card">
          <div className="muted">Closed</div>
          <div style={{ fontSize: 28, fontWeight: 800, marginTop: 6 }}>{counts.closed}</div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 14 }}>
        <div className="row" style={{ gap: 12, flexWrap: "wrap" }}>
          <label className="muted" style={{ display: "grid", gap: 6 }}>
            Status
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="">All</option>
              <option value="open">Open</option>
              <option value="reviewed">Reviewed</option>
              <option value="closed">Closed</option>
            </select>
          </label>
          <label className="muted" style={{ display: "grid", gap: 6 }}>
            Search (email)
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="name@domain.com" />
          </label>
          <div style={{ alignSelf: "end" }}>
            <button className="btn" onClick={refresh} disabled={status === "loading"}>
              Apply filters
            </button>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 14 }}>
        <h2>Inbox</h2>
        {rows.length === 0 ? (
          <p className="muted">No messages yet.</p>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {rows.map((r) => (
              <div key={r.id} className="notice">
                <div className="row" style={{ justifyContent: "space-between", gap: 10 }}>
                  <div>
                    <b>{r.subject}</b> <span className="muted">({r.email})</span>
                  </div>
                  <div className="row" style={{ gap: 8 }}>
                    <span className="badge">{r.status}</span>
                    <button className="btn" onClick={() => patch(r.id, { status: "reviewed" })} disabled={r.status === "reviewed"}>
                      Mark reviewed
                    </button>
                    <button className="btn" onClick={() => patch(r.id, { status: "closed" })} disabled={r.status === "closed"}>
                      Close
                    </button>
                  </div>
                </div>
                <div className="muted" style={{ marginTop: 6 }}>
                  {r.created_at}
                </div>
                <div style={{ marginTop: 10, whiteSpace: "pre-wrap" }}>{r.message}</div>

                <div style={{ marginTop: 10 }}>
                  <label className="muted" style={{ display: "grid", gap: 6 }}>
                    Internal note
                    <textarea
                      defaultValue={r.internal_note ?? ""}
                      rows={2}
                      onBlur={(e) => patch(r.id, { internal_note: e.target.value })}
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
