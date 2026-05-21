import Link from "next/link";

export function MarketingNavbar() {
  return (
    <header className="mkNav">
      <div className="mkNavInner">
        <Link className="mkBrand" href="/">
          <span className="mkLogo" aria-hidden />
          <span>Job Application Assistant</span>
          <span className="mkTag">Copilot</span>
        </Link>
        <nav className="mkNavLinks" aria-label="Primary">
          <Link href="/pricing">Pricing</Link>
          <Link href="/download">Download</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
        </nav>
        <div className="mkNavCtas">
          <Link className="mkBtn mkBtnGhost" href="/download">
            Install Extension
          </Link>
          <Link className="mkBtn mkBtnPrimary" href="/signup">
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}
