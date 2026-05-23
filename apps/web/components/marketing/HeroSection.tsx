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
            Autofill job applications, tailor cover letters, and track every opportunity while you stay in control.
          </p>
        <div className="mkHeroCtas">
          <Link className="mkBtn mkBtnPrimary mkBtnLg" href="/signup">
            Start applying smarter
          </Link>
            <Link className="mkBtn mkBtnGhost mkBtnLg" href="/#how-it-works">
              See how it works
            </Link>
          </div>
          <div className="mkHeroBadges" aria-label="Key constraints">
            <span className="mkBadge">
              <BoltIcon /> Faster applications
            </span>
            <span className="mkBadge">
              <ShieldIcon /> No auto-submit
            </span>
            <span className="mkBadge">
              <ShieldIcon /> No fake experience
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
