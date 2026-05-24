import Link from "next/link";
import { PlatformLogo } from "../../app/job-sites/platformLogos";

const SITES: Array<{
  id:
    | "linkedin"
    | "indeed"
    | "glassdoor"
    | "handshake"
    | "greenhouse"
    | "lever"
    | "workday"
    | "ashby"
    | "smartrecruiters";
  name: string;
  support: "full" | "partial" | "experimental";
  url: string;
}> = [
  { id: "linkedin", name: "LinkedIn", support: "partial", url: "https://www.linkedin.com/jobs/" },
  { id: "indeed", name: "Indeed", support: "partial", url: "https://www.indeed.com/" },
  { id: "glassdoor", name: "Glassdoor", support: "experimental", url: "https://www.glassdoor.com/Job/" },
  { id: "handshake", name: "Handshake", support: "partial", url: "https://app.joinhandshake.com/" },
  { id: "greenhouse", name: "Greenhouse", support: "full", url: "https://boards.greenhouse.io/" },
  { id: "lever", name: "Lever", support: "full", url: "https://jobs.lever.co/" },
  { id: "workday", name: "Workday", support: "experimental", url: "https://www.workday.com/" },
  { id: "ashby", name: "Ashby", support: "partial", url: "https://jobs.ashbyhq.com/" },
  { id: "smartrecruiters", name: "SmartRecruiters", support: "partial", url: "https://www.smartrecruiters.com/" }
];

function supportLabel(s: (typeof SITES)[number]["support"]) {
  if (s === "full") return "Full support";
  if (s === "partial") return "Partial support";
  return "Experimental";
}

export function SupportedSites() {
  return (
    <section className="mkSection">
      <div className="mkSectionHead">
        <h2 className="mkH2">Supported platforms</h2>
        <p className="mkMuted">Form detection + review-first autofill across common job sites and ATS systems.</p>
      </div>
      <div className="mkJobSitesGrid" aria-label="Supported platforms">
        {SITES.map((s) => (
          <div className="mkJobSiteCard" key={s.id}>
            <div className="mkJobSiteLogo" aria-hidden>
              <PlatformLogo id={s.id} size={44} variant="brand" />
            </div>
            <div className="mkJobSiteMeta">
              <div className="mkJobSiteName">{s.name}</div>
              <div className="mkJobSiteBadge">{supportLabel(s.support)}</div>
            </div>
            <a className="mkJobSiteBtn" href={s.url} target="_blank" rel="noreferrer">
              Open {s.name}
              <span aria-hidden style={{ opacity: 0.9 }}>
                ↗
              </span>
            </a>
          </div>
        ))}
      </div>
      <div className="mkHeroCtas" style={{ marginTop: 14 }}>
        <Link className="aiButton aiButtonPrimary" href="/job-sites">
          View Job Sites Hub
        </Link>
        <Link className="aiButton" href="/download">
          Install Extension
        </Link>
      </div>
    </section>
  );
}
