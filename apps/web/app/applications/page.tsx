"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { API_BASE, apiFetch, getToken } from "../lib/api";
import { track } from "../../lib/analytics";
import { useRequireAuth } from "../lib/auth";

export default function ApplicationsPage() {
  const { loading } = useRequireAuth();
  const [apps, setApps] = useState<any[]>([]);
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [error, setError] = useState<string | null>(null);

  async function downloadXlsx() {
    setError(null);
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/api/applications/export/xlsx`, {
        method: "GET",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined
      });
      if (!res.ok) throw new Error(await res.text());
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "job_applications.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      await track("excel_exported", { surface: "web_tracker" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Export failed");
    }
  }

  async function refresh() {
    setError(null);
    try {
      const res = await apiFetch<any[]>("/api/applications");
      setApps(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  const filtered = sourceFilter === "all" ? apps : apps.filter((a) => a.application_source === sourceFilter);

  return (
    <div className="container">
      {loading ? <div className="card" style={{ marginTop: 14 }}>Loading…</div> : null}
      <div className="nav">
        <div className="brand">
          <Link href="/">Hirely</Link>
          <span className="badge">Applications</span>
        </div>
        <div className="row">
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/jobs">Jobs</Link>
          <Link href="/settings">Settings</Link>
        </div>
      </div>

      <h1 className="h1">Application tracker</h1>
      <p className="muted">No external submission occurs here. “Submitted” means the user confirmed they submitted.</p>
      {error ? <p className="muted">{error}</p> : null}

      <div className="card" style={{ marginTop: 16 }}>
        <div className="row" style={{ justifyContent: "space-between", marginBottom: 10 }}>
          <div className="row">
            <label className="muted">Source</label>
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              style={{ padding: "10px 12px", borderRadius: 12, border: "1px solid var(--border)", background: "rgba(0,0,0,0.25)", color: "var(--text)" }}
            >
              <option value="all">All</option>
              <option value="indeed">Indeed</option>
              <option value="linkedin">LinkedIn</option>
              <option value="glassdoor">Glassdoor</option>
              <option value="handshake">Handshake</option>
              <option value="company_site">Company site</option>
              <option value="ats_greenhouse">Greenhouse</option>
              <option value="ats_lever">Lever</option>
              <option value="ats_workday">Workday</option>
              <option value="ats_ashby">Ashby</option>
              <option value="ats_smartrecruiters">SmartRecruiters</option>
              <option value="other">Other</option>
            </select>
            <button className="btn" onClick={refresh}>
              Refresh
            </button>
          </div>
          <button className="btn btnPrimary" onClick={downloadXlsx}>
            Export .xlsx
          </button>
        </div>

        {filtered.length === 0 ? (
          <p className="muted">No applications yet.</p>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {filtered.map((a) => (
              <div key={a.id} className="notice">
                <div className="row" style={{ justifyContent: "space-between" }}>
                  <span>
                    <b>{a.status}</b> · {a.application_source} · Job {a.job_id}
                  </span>
                  <Link className="btn" href={`/applications/${a.id}/review`}>
                    Review
                  </Link>
                </div>
                <div className="row" style={{ marginTop: 8 }}>
                  <label className="muted">Status</label>
                  <select
                    value={a.status}
                    onChange={async (e) => {
                      const next = e.target.value;
                      await apiFetch(`/api/applications/${a.id}`, {
                        method: "PATCH",
                        body: JSON.stringify({ status: next })
                      });
                      await track("application_recorded", { surface: "web_tracker_status_change" });
                      await refresh();
                    }}
                    style={{ padding: "8px 10px", borderRadius: 12, border: "1px solid var(--border)", background: "rgba(0,0,0,0.25)", color: "var(--text)" }}
                  >
                    <option value="draft">draft</option>
                    <option value="in_progress">in_progress</option>
                    <option value="needs_user_action">needs_user_action</option>
                    <option value="ready_for_review">ready_for_review</option>
                    <option value="submitted">submitted</option>
                    <option value="abandoned">abandoned</option>
                  </select>
                  <label className="muted">Follow-up</label>
                  <input
                    type="date"
                    value={a.follow_up_date ? String(a.follow_up_date).slice(0, 10) : ""}
                    onChange={async (e) => {
                      await apiFetch(`/api/applications/${a.id}`, {
                        method: "PATCH",
                        body: JSON.stringify({ follow_up_date: e.target.value || null })
                      });
                      await refresh();
                    }}
                    style={{ padding: "8px 10px", borderRadius: 12, border: "1px solid var(--border)", background: "rgba(0,0,0,0.25)", color: "var(--text)" }}
                  />
                </div>
                <div className="field" style={{ marginTop: 8 }}>
                  <label>Notes</label>
                  <textarea
                    defaultValue={a.notes ?? ""}
                    rows={3}
                    onBlur={async (e) => {
                      await apiFetch(`/api/applications/${a.id}`, {
                        method: "PATCH",
                        body: JSON.stringify({ notes: e.target.value })
                      });
                      await refresh();
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
