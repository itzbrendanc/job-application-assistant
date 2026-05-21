import { ShieldIcon } from "./icons";

const TRUST = [
  "No auto-submit",
  "No fake experience",
  "No CAPTCHA bypassing",
  "User-approved answers only",
  "Secure profile storage",
  "Audited actions for sensitive events"
];

export function TrustSection() {
  return (
    <section className="mkSection">
      <div className="mkSectionHead">
        <h2 className="mkH2">Trust & safety</h2>
        <p className="mkMuted">We optimize for credibility, compliance, and transparency.</p>
      </div>
      <div className="mkTrust">
        {TRUST.map((t) => (
          <div key={t} className="mkTrustItem">
            <ShieldIcon />
            <span>{t}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

