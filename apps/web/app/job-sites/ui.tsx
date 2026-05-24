"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type Category = "job_board" | "ats" | "university";
type Support = "full" | "partial" | "experimental";

type Filter = "all" | "best" | "ats" | "boards" | "university";

const SITES: Array<{
  id: string;
  name: string;
  url: string;
  category: Category;
  support: Support;
  description: string;
  extensionNote: string;
}> = [
  {
    id: "linkedin",
    name: "LinkedIn Jobs",
    url: "https://www.linkedin.com/jobs/",
    category: "job_board",
    support: "partial",
    description: "Find roles, save jobs, and apply on LinkedIn.",
    extensionNote: "Use the extension to detect and fill supported fields where permitted."
  },
  {
    id: "indeed",
    name: "Indeed",
    url: "https://www.indeed.com/",
    category: "job_board",
    support: "partial",
    description: "Search jobs and apply across Indeed listings.",
    extensionNote: "Use the extension on application forms; sensitive fields always require review."
  },
  {
    id: "glassdoor",
    name: "Glassdoor",
    url: "https://www.glassdoor.com/Job/",
    category: "job_board",
    support: "experimental",
    description: "Browse jobs and company insights.",
    extensionNote: "Experimental support. Field detection may vary by page and region."
  },
  {
    id: "handshake",
    name: "Handshake",
    url: "https://app.joinhandshake.com/",
    category: "university",
    support: "partial",
    description: "University-focused job and internship platform.",
    extensionNote: "Sign in on Handshake directly, then use the extension on supported application pages."
  },
  {
    id: "greenhouse",
    name: "Greenhouse",
    url: "https://boards.greenhouse.io/",
    category: "ats",
    support: "full",
    description: "Common ATS used on many company career pages.",
    extensionNote: "Best supported. Review mapped fields, then fill approved values only."
  },
  {
    id: "lever",
    name: "Lever",
    url: "https://jobs.lever.co/",
    category: "ats",
    support: "full",
    description: "Popular ATS with fast application flows.",
    extensionNote: "Best supported. Never auto-submits; you submit on the site."
  },
  {
    id: "workday",
    name: "Workday",
    url: "https://www.workday.com/",
    category: "ats",
    support: "experimental",
    description: "ATS with many variants across employers.",
    extensionNote: "Experimental support. Workday flows vary heavily; expect manual review."
  },
  {
    id: "ashby",
    name: "Ashby",
    url: "https://jobs.ashbyhq.com/",
    category: "ats",
    support: "partial",
    description: "Modern ATS used by startups and growth teams.",
    extensionNote: "Partial support. Some fields may be unsupported depending on form structure."
  },
  {
    id: "smartrecruiters",
    name: "SmartRecruiters",
    url: "https://www.smartrecruiters.com/",
    category: "ats",
    support: "partial",
    description: "Enterprise ATS with structured application steps.",
    extensionNote: "Partial support. Use the extension after you reach the application form."
  }
];

const FILTERS: Array<{ id: Filter; label: string; hint: string }> = [
  { id: "all", label: "All", hint: "Everything we currently support." },
  { id: "best", label: "Best supported", hint: "Where adapters are strongest." },
  { id: "ats", label: "ATS platforms", hint: "Greenhouse/Lever/Workday/etc." },
  { id: "boards", label: "Job boards", hint: "LinkedIn/Indeed/Glassdoor." },
  { id: "university", label: "University", hint: "Handshake and similar." }
];

function categoryLabel(c: Category): string {
  if (c === "ats") return "ATS platform";
  if (c === "university") return "University platform";
  return "Job board";
}

function supportLabel(s: Support): string {
  if (s === "full") return "Full";
  if (s === "partial") return "Partial";
  return "Experimental";
}

function supportTone(s: Support): { badge: string; detail: string } {
  if (s === "full") return { badge: "Full", detail: "Best supported" };
  if (s === "partial") return { badge: "Partial", detail: "Common flows" };
  return { badge: "Experimental", detail: "Varies by employer" };
}

function matchesFilter(site: (typeof SITES)[number], filter: Filter): boolean {
  if (filter === "all") return true;
  if (filter === "best") return site.support === "full";
  if (filter === "ats") return site.category === "ats";
  if (filter === "boards") return site.category === "job_board";
  return site.category === "university";
}

function Chip({ children }: { children: React.ReactNode }) {
  return <span className="mkChip">{children}</span>;
}

export function JobSitesHubClient() {
  const [filter, setFilter] = useState<Filter>("all");
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return SITES.filter((s) => matchesFilter(s, filter)).filter((s) => {
      if (!query) return true;
      return (
        s.name.toLowerCase().includes(query) ||
        s.description.toLowerCase().includes(query) ||
        categoryLabel(s.category).toLowerCase().includes(query)
      );
    });
  }, [filter, q]);

  return (
    <section className="mkSection">
      <div className="mkSectionHead">
        <h2 className="mkH2">Platforms</h2>
        <p className="mkMuted">Pick a site, sign in there directly, then use the extension on the application form.</p>
      </div>

      <div className="mkCard aiCard" style={{ marginBottom: 12 }}>
        <div style={{ display: "grid", gap: 12 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", justifyContent: "space-between" }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  className={`aiButton ${filter === f.id ? "aiButtonPrimary" : ""}`}
                  onClick={() => setFilter(f.id)}
                  aria-pressed={filter === f.id}
                  title={f.hint}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div style={{ minWidth: 240, width: "min(420px, 100%)" }}>
              <input
                className="aiInput"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search platforms…"
                aria-label="Search platforms"
              />
            </div>
          </div>

          <div className="mkMuted">
            Extension workflow: open the site, navigate to an application form, then use Hirely’s side panel to scan fields,
            review suggestions, and fill approved values. Submission stays user-controlled.
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="mkCard aiCard">
          <div style={{ fontWeight: 860 }}>No matches</div>
          <div className="mkMuted" style={{ marginTop: 6 }}>
            Try clearing the search or switching filters.
          </div>
        </div>
      ) : null}

      <div className="mkGrid3" aria-label="Job sites grid">
        {filtered.map((s) => {
          const tone = supportTone(s.support);
          return (
            <div key={s.id} className="mkCard mkCardHover aiCard">
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "start" }}>
                <div style={{ display: "grid", gap: 6 }}>
                  <div style={{ fontWeight: 860, letterSpacing: -0.2 }}>{s.name}</div>
                  <div className="mkMuted">{s.description}</div>
                </div>
                <span className="mkBest" title={tone.detail}>
                  {tone.badge}
                </span>
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
                <Chip>{categoryLabel(s.category)}</Chip>
                <Chip>Support: {supportLabel(s.support)}</Chip>
              </div>

              <div className="mkMuted" style={{ marginTop: 12 }}>
                <b>Use extension here:</b> {s.extensionNote}
              </div>

              <div style={{ marginTop: 14, display: "flex", flexWrap: "wrap", gap: 10 }}>
                <a className="aiButton aiButtonPrimary" href={s.url} target="_blank" rel="noreferrer">
                  Open site
                </a>
                <Link className="aiButton" href="/download">
                  Install extension
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

