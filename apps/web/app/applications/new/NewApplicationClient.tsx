"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { apiFetch } from "../../lib/api";
import { useRequireAuth } from "../../lib/auth";

export default function NewApplicationClient() {
  const { loading } = useRequireAuth();
  const router = useRouter();
  const params = useSearchParams();
  const jobId = params.get("jobId") ?? "";
  const [error, setError] = useState<string | null>(null);

  async function create() {
    setError(null);
    try {
      const res = await apiFetch<{ id: string }>("/api/applications", {
        method: "POST",
        body: JSON.stringify({ job_id: jobId, source_mode: "manual_export" })
      });
      router.push(`/applications/${res.id}/review`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    }
  }

  return (
    <div className="container">
      {loading ? <div className="card" style={{ marginTop: 14 }}>Loading…</div> : null}
      <div className="nav">
        <div className="brand">
          <Link href="/">Hirely</Link>
          <span className="badge">New application</span>
        </div>
        <div className="row">
          <Link href="/jobs">Jobs</Link>
          <Link href="/applications">Applications</Link>
        </div>
      </div>

      <h1 className="h1">Start application</h1>
      <div className="card">
        <p className="muted">Job ID: {jobId || "(missing)"} </p>
        <div className="notice">
          Hard constraint: this app never auto-submits. It prepares a review packet and records your explicit “submit”
          click for tracking/auditing.
        </div>
        <div className="row" style={{ marginTop: 12 }}>
          <button className="btn btnPrimary" onClick={create} disabled={!jobId}>
            Create application draft
          </button>
        </div>
        {error ? <p className="muted">{error}</p> : null}
      </div>
    </div>
  );
}
