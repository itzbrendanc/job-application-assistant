"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { apiFetch } from "../../lib/api";
import { useRequireAuth } from "../../lib/auth";

export default function CoverLetterClient() {
  const { loading } = useRequireAuth();
  const params = useSearchParams();
  const jobId = params.get("jobId");
  const [body, setBody] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setError(null);
    try {
      const res = await apiFetch<{ bodyMarkdown: string }>(
        `/api/cover-letters/generate${jobId ? `?job_id=${encodeURIComponent(jobId)}` : ""}`,
        { method: "POST", body: JSON.stringify({}) }
      );
      setBody(res.bodyMarkdown);
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
          <span className="badge">Cover letter</span>
        </div>
        <div className="row">
          <Link href="/jobs">Jobs</Link>
          <Link href="/applications">Applications</Link>
        </div>
      </div>

      <h1 className="h1">AI cover letter (editable)</h1>
      <div className="notice">
        Guardrail: generated content must only use user-approved facts. This screen is intentionally editable before any
        export/submission.
      </div>

      <div className="grid">
        <div className="card">
          <h2>Generate</h2>
          <p className="muted">Job: {jobId ?? "(none)"} </p>
          <div className="row">
            <button className="btn btnPrimary" onClick={generate}>
              Generate from approved facts
            </button>
          </div>
          {error ? <p className="muted">{error}</p> : null}
        </div>
        <div className="card">
          <h2>Editor</h2>
          <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={18} />
        </div>
      </div>
    </div>
  );
}
