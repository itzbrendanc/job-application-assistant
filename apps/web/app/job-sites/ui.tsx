"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { PlatformLogo } from "./platformLogos";

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
    <section className="jsPage">
      <div className="jsInner">
        <div className="jsTop">
          <div className="jsHero">
            <div className="jsKicker">JOB SITES</div>
            <h1 className="jsH1">
              Access top job platforms <span className="aiGradientText">in one place</span>
            </h1>
            <p className="jsLead">
              Open your favorite job sites and use the Hirely extension to autofill forms — always review first.
            </p>
          </div>

          <div className="jsControls">
            <div className="jsPillBar" role="tablist" aria-label="Platform filters">
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  className={`jsPill ${filter === f.id ? "jsPillActive" : ""}`}
                  onClick={() => setFilter(f.id)}
                  aria-pressed={filter === f.id}
                  title={f.hint}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="jsSearch">
              <span className="jsSearchIcon" aria-hidden>
                <SearchIcon />
              </span>
              <input
                className="jsSearchInput"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search platforms…"
                aria-label="Search platforms"
              />
            </div>
          </div>
        </div>

      {filtered.length === 0 ? (
        <div className="mkCard aiCard jsEmpty">
          <div style={{ fontWeight: 860 }}>No matches</div>
          <div className="mkMuted" style={{ marginTop: 6 }}>
            Try clearing the search or switching filters.
          </div>
        </div>
      ) : null}

      <div className="jsGrid" aria-label="Job sites grid">
        {filtered.map((s) => {
          const tone = supportTone(s.support);
          return (
            <div key={s.id} className="jsPlatformCard">
              <div className="jsSpark" aria-hidden>
                <Sparkle />
              </div>

              <div className="jsCardTop">
                <div className="jsLogoBadge" aria-hidden>
                  <PlatformLogo id={s.id as any} size={44} variant="brand" />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div className="jsPlatformName">{s.name.replace(" Jobs", "")}</div>
                  <div className={`jsSupport ${s.support === "full" ? "jsSupportFull" : s.support === "partial" ? "jsSupportPartial" : "jsSupportExp"}`}>
                    {tone.badge} support
                  </div>
                </div>
              </div>

              <div className="jsDesc">{s.description}</div>

              <a className="jsOpenBtn" href={s.url} target="_blank" rel="noreferrer">
                Open {s.name.replace(" Jobs", "")} <ExternalLinkIcon />
              </a>
            </div>
          );
        })}
      </div>

      <div className="jsNote">
        <div className="jsNoteTitle">Extension workflow</div>
        <div className="jsNoteBody">
          Open a platform, sign in there directly, then use Hirely’s side panel to scan fields, review suggestions, and fill
          approved values. Submission stays user-controlled. Hirely does not bypass CAPTCHAs or security checks.
        </div>
      </div>
      </div>
    </section>
  );
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M10.8 18.4a7.6 7.6 0 1 1 0-15.2 7.6 7.6 0 0 1 0 15.2Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path d="M16.6 16.6 21 21" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function ExternalLinkIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M14 5h5v5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 14 19 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path
        d="M19 14v5a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function Sparkle() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 2l1.2 5.1L18 8.4l-4.8 1.3L12 15l-1.2-5.3L6 8.4l4.8-1.3L12 2Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
    </svg>
  );
}
