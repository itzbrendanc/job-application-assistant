"use client";

import Link from "next/link";
import { useState } from "react";
import { API_BASE, apiFetch, getToken } from "../lib/api";
import { track } from "../../lib/analytics";
import { useRequireAuth } from "../lib/auth";

export default function OnboardingPage() {
  const { loading } = useRequireAuth();
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  async function upload() {
    setError(null);
    setResult(null);
    if (!file) return;
    const form = new FormData();
    form.set("file", file);
    const token = getToken();
    const res = await fetch(`${API_BASE}/api/profile/resume/upload`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: form
    });
    if (!res.ok) {
      setError(await res.text());
      return;
    }
    setResult(await res.json());
    await track("resume_uploaded", { surface: "web_onboarding" });
  }

  return (
    <div className="container">
      {loading ? <div className="card" style={{ marginTop: 14 }}>Loading…</div> : null}
      <div className="nav">
        <div className="brand">
          <Link href="/">Job Application Assistant</Link>
          <span className="badge">Onboarding</span>
        </div>
        <div className="row">
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/jobs">Jobs</Link>
          <Link href="/applications">Applications</Link>
        </div>
      </div>

      <h1 className="h1">Onboarding</h1>
      <div className="notice">
        Resume parsing is stubbed and conservative. It never invents experience; it only extracts what’s present in the
        file, then requires user approval before facts are used for AI generation.
      </div>

      <div className="grid">
        <div className="card">
          <h2>Upload resume</h2>
          <div className="field">
            <label>Resume file (txt/pdf exported to text is fine for MVP)</label>
            <input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          </div>
          <div className="row">
            <button className="btn btnPrimary" onClick={upload}>
              Upload + parse
            </button>
            <button
              className="btn"
              onClick={async () => {
                try {
                  await apiFetch("/api/profile/ingest/linkedin", { method: "POST", body: JSON.stringify({}) });
                } catch (e) {
                  setError(e instanceof Error ? e.message : "Unknown error");
                }
              }}
            >
              LinkedIn ingest (stub)
            </button>
          </div>
          {error ? <p className="muted">{error}</p> : null}
        </div>
        <div className="card">
          <h2>Result</h2>
          <pre style={{ whiteSpace: "pre-wrap" }}>{result ? JSON.stringify(result, null, 2) : "No upload yet."}</pre>
        </div>
      </div>
    </div>
  );
}
