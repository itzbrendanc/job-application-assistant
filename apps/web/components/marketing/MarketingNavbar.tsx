import Link from "next/link";
import { HirelyLogo } from "../brand/HirelyLogo";

export function MarketingNavbar() {
  return (
    <header className="mkNav">
      <div className="mkNavInner">
        <div className="mkBrand">
          <HirelyLogo href="/" />
          <span className="mkTag">Copilot</span>
        </div>
        <nav className="mkNavLinks" aria-label="Primary">
          <Link href="/pricing">Pricing</Link>
          <Link href="/download">Download</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
        </nav>
        <div className="mkNavCtas">
          <Link className="mkBtn mkBtnGhost" href="/#how-it-works">
            See how it works
          </Link>
          <Link className="mkBtn mkBtnPrimary" href="/signup">
            Start applying smarter
          </Link>
        </div>
      </div>
    </header>
  );
}
