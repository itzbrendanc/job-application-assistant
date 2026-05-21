"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiFetch } from "../../lib/api";
import { useRequireAuth } from "../../lib/auth";

export default function JobDetailClient({ jobId }: { jobId: string }) {
  const { loading } = useRequireAuth();
  const [job, setJob] = useState<any>(null);
  const [fit, setFit] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setError(null);
      try {
        const j = await apiFetch(`/api/jobs/${jobId}`);
        setJob(j);
        const f = await apiFetch(`/api/jobs/${jobId}/fit`);
        setFit(f);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unknown error");
      }
    })();
  }, [jobId]);

  return (
    <div className="container">
      {loading ? <div className="card" style={{ marginTop: 14 }}>Loading…</div> : null}
      <div className="nav">
        <div className="brand">
          <Link href="/">Job Application Assistant</Link>
          <span className="badge">Job</span>
        </div>
        <div className="row">
          <Link href="/jobs">Jobs</Link>
          <Link href="/applications">Applications</Link>
        </div>
      </div>

      <h1 className="h1">{job ? `${job.company_name} · ${job.title}` : "Loading..."}</h1>
      {error ? <p className="muted">{error}</p> : null}

      <div className="grid">
        <div className="card">
          <h2>Description</h2>
          <pre style={{ whiteSpace: "pre-wrap" }}>{job?.description_raw ?? ""}</pre>
        </div>
        <div className="card">
          <h2>Fit score</h2>
          <div className="notice">
            Fit score is explainable and conservative; uncertainties are always shown.
          </div>
          <pre style={{ whiteSpace: "pre-wrap" }}>{fit ? JSON.stringify(fit, null, 2) : "No fit yet."}</pre>
          <div className="row" style={{ marginTop: 10 }}>
            <Link className="btn" href={`/documents/cover-letter?jobId=${jobId}`}>
              Generate cover letter
            </Link>
            <Link className="btn btnPrimary" href={`/applications/new?jobId=${jobId}`}>
              Start application
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
