"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiFetch } from "../../../lib/api";
import { useRequireAuth } from "../../../lib/auth";

export default function ReviewClient({ applicationId }: { applicationId: string }) {
  const { loading } = useRequireAuth();
  const [review, setReview] = useState<any>(null);
  const [confirm, setConfirm] = useState(false);
  const [submitResult, setSubmitResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setError(null);
      try {
        const r = await apiFetch(`/api/applications/${applicationId}/final-review`, {
          method: "POST",
          body: JSON.stringify({})
        });
        setReview(r);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unknown error");
      }
    })();
  }, [applicationId]);

  async function submit() {
    setError(null);
    try {
      const r = await apiFetch(`/api/applications/${applicationId}/submit`, {
        method: "POST",
        body: JSON.stringify({ user_confirmed: confirm })
      });
      setSubmitResult(r);
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
          <span className="badge">Review</span>
        </div>
        <div className="row">
          <Link href="/applications">Applications</Link>
          <Link href="/jobs">Jobs</Link>
        </div>
      </div>

      <h1 className="h1">Final review</h1>
      <div className="notice danger">
        This does not submit to external sites. It records your explicit confirmation and stores the review packet +
        audit log.
      </div>

      {error ? <p className="muted">{error}</p> : null}

      <div className="grid">
        <div className="card">
          <h2>Review packet</h2>
          <pre style={{ whiteSpace: "pre-wrap" }}>{review ? JSON.stringify(review, null, 2) : "Loading..."}</pre>
        </div>
        <div className="card">
          <h2>Submit action</h2>
          <div className="field">
            <label>
              <input type="checkbox" checked={confirm} onChange={(e) => setConfirm(e.target.checked)} /> I confirm I want
              to submit this application (explicit action)
            </label>
          </div>
          <div className="row">
            <button className="btn btnPrimary" onClick={submit}>
              Submit application
            </button>
          </div>
          <pre style={{ whiteSpace: "pre-wrap" }}>
            {submitResult ? JSON.stringify(submitResult, null, 2) : "No submit yet."}
          </pre>
        </div>
      </div>
    </div>
  );
}
