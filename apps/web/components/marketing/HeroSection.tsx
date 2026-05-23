import Link from "next/link";
import { BoltIcon, ShieldIcon } from "./icons";
import { ProductMockup } from "./ProductMockup";

export function HeroSection() {
  return (
    <section className="mkHero">
      <div className="mkHeroInner">
        <div className="mkHeroCopy">
          <div className="mkEyebrow">
            <ShieldIcon /> Trustworthy by design
          </div>
          <h1 className="mkH1">Your AI job application copilot</h1>
          <p className="mkLead">
            Review-first autofill, tailored cover letters, and an application tracker that stays accurate and audit-ready.
          </p>
        <div className="mkHeroCtas">
          <Link className="mkBtn mkBtnPrimary mkBtnLg" href="/signup">
            Start applying smarter
          </Link>
            <Link className="mkBtn mkBtnGhost mkBtnLg" href="/#how-it-works">
              See how it works
            </Link>
          </div>
          <div className="mkHeroBadges" aria-label="Core guarantees">
            <span className="mkBadge">
              <BoltIcon /> Review-first autofill
            </span>
            <span className="mkBadge">
              <ShieldIcon /> User-controlled submission
            </span>
            <span className="mkBadge">
              <ShieldIcon /> No fabricated experience
            </span>
            <span className="mkBadge">
              <ShieldIcon /> No CAPTCHA bypassing
            </span>
          </div>
        </div>
        <div className="mkHeroMock">
          <ProductMockup />
        </div>
      </div>
    </section>
  );
}
