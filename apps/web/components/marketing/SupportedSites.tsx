const SITES = [
  "LinkedIn",
  "Indeed",
  "Glassdoor",
  "Handshake",
  "Greenhouse",
  "Lever",
  "Workday",
  "Ashby",
  "SmartRecruiters"
];

export function SupportedSites() {
  return (
    <section className="mkSection">
      <div className="mkSectionHead">
        <h2 className="mkH2">Supported platforms</h2>
        <p className="mkMuted">Form detection + review-first autofill across common job sites and ATS systems.</p>
      </div>
      <div className="mkSiteGrid" aria-label="Supported platforms">
        {SITES.map((s) => (
          <div className="mkSite" key={s}>
            {s}
          </div>
        ))}
      </div>
    </section>
  );
}

