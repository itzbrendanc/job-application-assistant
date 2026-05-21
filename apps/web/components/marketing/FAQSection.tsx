const FAQ = [
  {
    q: "Does it auto-submit applications?",
    a: "No. The extension never clicks submit. You review and personally submit on the website."
  },
  {
    q: "Does it bypass CAPTCHAs or login protections?",
    a: "No. It does not bypass CAPTCHAs, paywalls, or login protections."
  },
  {
    q: "Will it fabricate experience or skills?",
    a: "No. Generated content is restricted to user-approved profile facts and is always editable before use."
  },
  {
    q: "Which sites are supported?",
    a: "Common platforms and ATS: LinkedIn, Indeed, Glassdoor, Handshake, Greenhouse, Lever, Workday, Ashby, SmartRecruiters, and many company career pages."
  },
  {
    q: "What does the Free plan include?",
    a: "10 tracked applications/month with limited features. Pro unlocks unlimited tracker, extension autofill, cover letters, and Excel export."
  }
];

export function FAQSection() {
  return (
    <section className="mkSection">
      <div className="mkSectionHead">
        <h2 className="mkH2">FAQ</h2>
        <p className="mkMuted">Straight answers on safety, privacy, and automation boundaries.</p>
      </div>
      <div className="mkFaq">
        {FAQ.map((f) => (
          <details key={f.q} className="mkFaqItem">
            <summary className="mkFaqQ">{f.q}</summary>
            <div className="mkMuted" style={{ marginTop: 8 }}>
              {f.a}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
