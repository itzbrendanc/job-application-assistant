"use client";

import Link from "next/link";
import { useState } from "react";
import { apiFetch } from "../lib/api";
import { useRequireAuth } from "../lib/auth";

export default function SettingsPage() {
  const { loading } = useRequireAuth();
  const [exportRes, setExportRes] = useState<any>(null);
  const [deleteRes, setDeleteRes] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="container">
      {loading ? <div className="card" style={{ marginTop: 14 }}>Loading…</div> : null}
      <div className="nav">
        <div className="brand">
          <Link href="/">Hirely</Link>
          <span className="badge">Settings</span>
        </div>
        <div className="row">
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/applications">Applications</Link>
          <Link href="/jobs">Jobs</Link>
        </div>
      </div>

      <h1 className="h1">Privacy & Settings</h1>
      <div className="notice">
        Automation is opt-in only. This starter keeps deletion/export endpoints stubbed but audited.
      </div>

      <div className="grid">
        <div className="card">
          <h2>Export</h2>
          <button
            className="btn"
            onClick={async () => {
              setError(null);
              try {
                setExportRes(await apiFetch("/api/privacy/export", { method: "POST", body: JSON.stringify({}) }));
              } catch (e) {
                setError(e instanceof Error ? e.message : "Unknown error");
              }
            }}
          >
            Request export (stub)
          </button>
          <pre style={{ whiteSpace: "pre-wrap" }}>{exportRes ? JSON.stringify(exportRes, null, 2) : ""}</pre>
        </div>
        <div className="card">
          <h2>Delete</h2>
          <button
            className="btn btnDanger"
            onClick={async () => {
              setError(null);
              try {
                setDeleteRes(await apiFetch("/api/privacy/data", { method: "DELETE" }));
              } catch (e) {
                setError(e instanceof Error ? e.message : "Unknown error");
              }
            }}
          >
            Request deletion (stub)
          </button>
          {error ? <p className="muted">{error}</p> : null}
          <pre style={{ whiteSpace: "pre-wrap" }}>{deleteRes ? JSON.stringify(deleteRes, null, 2) : ""}</pre>
        </div>
      </div>
    </div>
  );
}
