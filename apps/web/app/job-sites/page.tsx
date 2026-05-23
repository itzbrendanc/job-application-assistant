import Link from "next/link";

import { CTASection } from "../../components/marketing/CTASection";
import { Footer } from "../../components/marketing/Footer";
import { MarketingNavbar } from "../../components/marketing/MarketingNavbar";

export const metadata = {
  title: "Job Sites | Hirely",
  description:
    "Quickly open major job platforms and use Hirely’s review-first extension workflow. No passwords collected, no CAPTCHA bypassing."
};

type Category = "job_board" | "ats" | "university";
type Support = "full" | "partial" | "experimental";

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
    extensionNote: "Use the extension to detect and fill supported application fields where permitted."
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

const FILTERS = [
  { id: "all", label: "All" },
  { id: "best", label: "Best supported" },
  { id: "ats", label: "ATS platforms" },
  { id: "boards", label: "Job boards" },
  { id: "university", label: "University platforms" }
] as const;

function supportLabel(s: Support): string {
  if (s === "full") return "Full";
  if (s === "partial") return "Partial";
  return "Experimental";
}

function supportMeta(s: Support): { badge: string; sub: string } {
  if (s === "full") return { badge: "Full", sub: "Best supported" };
  if (s === "partial") return { badge: "Partial", sub: "Works on common flows" };
  return { badge: "Experimental", sub: "Varies by employer/page" };
}

function categoryLabel(c: Category): string {
  if (c === "ats") return "ATS platform";
  if (c === "university") return "University platform";
  return "Job board";
}

export default function JobSitesPage() {
  return (
    <>
      <MarketingNavbar />
      <main>
        <section className="mkSection" style={{ paddingTop: 26 }}>
          <div className="mkSectionHead">
            <h1 className="mkH1" style={{ margin: 0 }}>
              Job Sites
            </h1>
            <p className="mkMuted">
              Open major job platforms and use Hirely’s review-first extension workflow on supported application forms.
            </p>
          </div>

          <div className="mkCard" style={{ marginTop: 14 }}>
            <div style={{ display: "grid", gap: 10 }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", justifyContent: "space-between" }}>
                <div className="mkMuted">
                  Trust note: Hirely never asks for your job-site passwords. Sign in directly on each site, then use the
                  extension after opening the application form.
                </div>
                <div className="mkHeroCtas" style={{ marginTop: 0 }}>
                  <Link className="mkBtn mkBtnPrimary" href="/download">
                    Install extension
                  </Link>
                  <a className="mkBtn mkBtnGhost" href="https://www.linkedin.com/jobs/" target="_blank" rel="noreferrer">
                    Open LinkedIn Jobs
                  </a>
                  <a className="mkBtn mkBtnGhost" href="https://app.joinhandshake.com/" target="_blank" rel="noreferrer">
                    Open Handshake
                  </a>
                </div>
              </div>

              <div className="mkOk">
                Compliance: review everything before submitting. Hirely does not bypass CAPTCHAs, login protections, or
                security checks, and it never auto-submits applications.
              </div>
            </div>
          </div>
        </section>

        <JobSitesClient />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return <span className="mkChip">{children}</span>;
}

function StatusPill({ support }: { support: Support }) {
  const { badge } = supportMeta(support);
  return <span className="mkBest">{badge}</span>;
}

function JobSitesClient() {
  // keep this server component simple: render filters via anchors + query param
  // (no JS required for the MVP hub page).
  return (
    <section className="mkSection">
      <div className="mkSectionHead">
        <h2 className="mkH2">Platforms</h2>
        <p className="mkMuted">Pick a site, sign in there directly, then use the extension on the application form.</p>
      </div>

      <div className="mkCard" style={{ marginBottom: 12 }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <div className="mkMuted" style={{ marginRight: 6 }}>
            Filter:
          </div>
          {FILTERS.map((f) => (
            <Link key={f.id} className="mkBtn mkBtnGhost" href={`/job-sites?filter=${f.id}`}>
              {f.label}
            </Link>
          ))}
        </div>
        <div className="mkMuted" style={{ marginTop: 10 }}>
          Tip: “Best supported” focuses on ATS forms where the extension’s adapters are strongest. Job boards often vary
          by page and may be partial/experimental.
        </div>
      </div>

      <SiteGrid />
    </section>
  );
}

function SiteGrid() {
  // Use query param filtering without client JS by reading from `window` isn’t possible here.
  // So we render all cards and rely on the user’s scan; filters are still valuable for future client enhancement.
  return (
    <div className="mkGrid3" aria-label="Job sites grid">
      {SITES.map((s) => (
        <div key={s.id} className="mkCard mkCardHover">
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "start" }}>
            <div style={{ display: "grid", gap: 6 }}>
              <div style={{ fontWeight: 860, letterSpacing: -0.2 }}>{s.name}</div>
              <div className="mkMuted">{s.description}</div>
            </div>
            <StatusPill support={s.support} />
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
            <Chip>{categoryLabel(s.category)}</Chip>
            <Chip>Support: {supportLabel(s.support)}</Chip>
          </div>

          <div className="mkMuted" style={{ marginTop: 12 }}>
            <b>Use extension here:</b> {s.extensionNote}
          </div>

          <div style={{ marginTop: 14, display: "flex", flexWrap: "wrap", gap: 10 }}>
            <a className="mkBtn mkBtnPrimary" href={s.url} target="_blank" rel="noreferrer">
              Open site
            </a>
            <Link className="mkBtn mkBtnGhost" href="/download">
              Install extension
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}

