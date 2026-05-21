"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiFetch } from "../../lib/api";
import { useRequireAuth } from "../../lib/auth";

export default function AdminFeedbackClient() {
  const { loading } = useRequireAuth();
  const [items, setItems] = useState<any[]>([]);
  const [category, setCategory] = useState<string>("");
  const [rating, setRating] = useState<string>("");
  const [reviewed, setReviewed] = useState<string>("unreviewed");
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    setError(null);
    const qs = new URLSearchParams();
    if (category) qs.set("category", category);
    if (rating) qs.set("rating", rating);
    if (reviewed === "reviewed") qs.set("reviewed", "true");
    if (reviewed === "unreviewed") qs.set("reviewed", "false");
    qs.set("limit", "100");
    try {
      const res = await apiFetch<any[]>(`/api/admin/feedback?${qs.toString()}`);
      setItems(res);
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
          <span className="badge">Feedback</span>
        </div>
        <div className="row">
          <Link href="/admin/analytics">Analytics</Link>
          <Link href="/admin/waitlist">Waitlist</Link>
          <Link href="/admin/support">Support</Link>
          <button className="btn" onClick={refresh}>
            Refresh
          </button>
        </div>
      </div>

      <h1 className="h1">Feedback inbox</h1>
      {error ? <div className="notice danger">{error}</div> : null}

      <div className="card" style={{ marginTop: 12 }}>
        <div className="row">
          <div className="field" style={{ margin: 0 }}>
            <label>Category</label>
            <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="beta" />
          </div>
          <div className="field" style={{ margin: 0 }}>
            <label>Rating</label>
            <input value={rating} onChange={(e) => setRating(e.target.value)} placeholder="1-5" />
          </div>
          <div className="field" style={{ margin: 0 }}>
            <label>Reviewed</label>
            <select
              value={reviewed}
              onChange={(e) => setReviewed(e.target.value)}
              style={{
                padding: "10px 12px",
                borderRadius: 12,
                border: "1px solid var(--border)",
                background: "rgba(0,0,0,0.25)",
                color: "var(--text)"
              }}
            >
              <option value="unreviewed">Unreviewed</option>
              <option value="reviewed">Reviewed</option>
              <option value="all">All</option>
            </select>
          </div>
          <button className="btn btnPrimary" onClick={refresh}>
            Apply filters
          </button>
        </div>
      </div>

      <div className="card" style={{ marginTop: 14 }}>
        {items.length === 0 ? (
          <p className="muted">No feedback yet.</p>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {items.map((f) => (
              <div key={f.id} className="notice">
                <div className="row" style={{ justifyContent: "space-between" }}>
                  <b>{f.category}</b>
                  <span className="muted">{f.created_at}</span>
                </div>
                <div className="muted">{f.email ?? "(no email)"} · rating {f.rating ?? "-"}</div>
                <div style={{ marginTop: 8, whiteSpace: "pre-wrap" }}>{f.message}</div>
                <div className="field" style={{ marginTop: 10 }}>
                  <label>Internal note</label>
                  <textarea
                    defaultValue={f.internal_note ?? ""}
                    rows={2}
                    onBlur={async (e) => {
                      await apiFetch(`/api/admin/feedback/${f.id}`, {
                        method: "PATCH",
                        body: JSON.stringify({ internal_note: e.target.value })
                      });
                      await refresh();
                    }}
                  />
                </div>
                <div className="row" style={{ marginTop: 8 }}>
                  <button
                    className="btn"
                    onClick={async () => {
                      await apiFetch(`/api/admin/feedback/${f.id}`, {
                        method: "PATCH",
                        body: JSON.stringify({ reviewed: !f.reviewed })
                      });
                      await refresh();
                    }}
                  >
                    {f.reviewed ? "Mark unreviewed" : "Mark reviewed"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
