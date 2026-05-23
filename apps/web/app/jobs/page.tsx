"use client";

import Link from "next/link";
import { useState } from "react";
import { apiFetch } from "../lib/api";
import { useRequireAuth } from "../lib/auth";

export default function JobsPage() {
  const { loading } = useRequireAuth();
  const [companyName, setCompanyName] = useState("ExampleCo");
  const [title, setTitle] = useState("Backend Engineer");
  const [descriptionRaw, setDescriptionRaw] = useState("Looking for Python + FastAPI + Postgres experience.");
  const [createdJobId, setCreatedJobId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function createJob() {
    setError(null);
    try {
      const res = await apiFetch<{ id: string }>("/api/jobs", {
        method: "POST",
        body: JSON.stringify({
          company_name: companyName,
          title,
          description_raw: descriptionRaw
        })
      });
      setCreatedJobId(res.id);
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
          <span className="badge">Jobs</span>
        </div>
        <div className="row">
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/applications">Applications</Link>
          <Link href="/settings">Settings</Link>
        </div>
      </div>

      <h1 className="h1">Job Import</h1>
      <p className="muted">
        MVP: manual job import. Replace with allowed sources and official APIs where permitted.
      </p>

      <div className="grid">
        <div className="card">
          <h2>Create a job</h2>
          <div className="field">
            <label>Company</label>
            <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
          </div>
          <div className="field">
            <label>Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="field">
            <label>Description</label>
            <textarea value={descriptionRaw} onChange={(e) => setDescriptionRaw(e.target.value)} rows={6} />
          </div>
          <div className="row">
            <button className="btn btnPrimary" onClick={createJob}>
              Save job
            </button>
            {createdJobId ? (
              <Link className="btn" href={`/jobs/${createdJobId}`}>
                Open job
              </Link>
            ) : null}
          </div>
          {error ? <p className="muted">{error}</p> : null}
        </div>
        <div className="card">
          <h2>Fit scoring</h2>
          <div className="notice">
            Fit scoring currently uses only approved profile facts (`profile_facts.approval_status = approved`). If you
            haven’t approved any facts yet, the score will be conservative.
          </div>
        </div>
      </div>
    </div>
  );
}
