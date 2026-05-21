"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../../lib/api";
import { useRequireAuth } from "../../lib/auth";

type WaitlistRow = {
  id: string;
  email: string;
  role: string | null;
  job_search_status: string | null;
  source: string | null;
  created_at: string;
};

export default function AdminWaitlistClient() {
  const { loading } = useRequireAuth();
  const [rows, setRows] = useState<WaitlistRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [source, setSource] = useState("");
  const [status, setStatus] = useState<"idle" | "loading">("idle");

  async function refresh() {
    setStatus("loading");
    setError(null);
    try {
      const qs = new URLSearchParams();
      if (q.trim()) qs.set("q", q.trim());
      if (source.trim()) qs.set("source", source.trim());
      const data = await apiFetch<WaitlistRow[]>(`/api/admin/waitlist?${qs.toString()}`);
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

  const sources = useMemo(() => {
    const s = new Set<string>();
    for (const r of rows) if (r.source) s.add(r.source);
    return Array.from(s).sort();
  }, [rows]);

  async function createInvite(email: string) {
    try {
      await apiFetch(`/api/admin/beta-invites`, {
        method: "POST",
        body: JSON.stringify({ email })
      });
      alert("Invite created (or reset). You can view it via the API list endpoint.");
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to create invite");
    }
  }

  return (
    <div className="container">
      {loading ? <div className="card" style={{ marginTop: 14 }}>Loading…</div> : null}
      <div className="nav">
        <div className="brand">
          <Link href="/admin">Admin</Link>
          <span className="badge">Waitlist</span>
        </div>
        <div className="row">
          <Link href="/admin/analytics">Analytics</Link>
          <Link href="/admin/feedback">Feedback</Link>
          <Link href="/admin/support">Support</Link>
          <button className="btn" onClick={refresh} disabled={status === "loading"}>
            {status === "loading" ? "Refreshing…" : "Refresh"}
          </button>
        </div>
      </div>

      <h1 className="h1">Waitlist</h1>
      {error ? <div className="notice danger">{error}</div> : null}

      <div className="card" style={{ marginTop: 14 }}>
        <div className="row" style={{ gap: 12, flexWrap: "wrap" }}>
          <label className="muted" style={{ display: "grid", gap: 6 }}>
            Search (email)
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="name@domain.com" />
          </label>
          <label className="muted" style={{ display: "grid", gap: 6 }}>
            Source
            <select value={source} onChange={(e) => setSource(e.target.value)}>
              <option value="">All</option>
              {sources.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <div style={{ alignSelf: "end" }}>
            <button className="btn" onClick={refresh} disabled={status === "loading"}>
              Apply filters
            </button>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 14 }}>
        <h2>Entries</h2>
        {rows.length === 0 ? (
          <p className="muted">No waitlist entries yet.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th align="left">Email</th>
                  <th align="left">Role</th>
                  <th align="left">Status</th>
                  <th align="left">Source</th>
                  <th align="left">Created</th>
                  <th align="left">Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                    <td>{r.email}</td>
                    <td className="muted">{r.role ?? "—"}</td>
                    <td className="muted">{r.job_search_status ?? "—"}</td>
                    <td className="muted">{r.source ?? "—"}</td>
                    <td className="muted">{r.created_at}</td>
                    <td>
                      <button className="btn" onClick={() => createInvite(r.email)}>
                        Create invite
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
