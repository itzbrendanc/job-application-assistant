import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="container">
      <div className="nav">
        <div className="brand">
          <Link href="/">Hirely</Link>
          <span className="badge">Terms</span>
        </div>
        <div className="row">
          <Link href="/privacy">Privacy</Link>
          <Link href="/pricing">Pricing</Link>
        </div>
      </div>
      <h1 className="h1">Terms</h1>
      <div className="card" style={{ marginTop: 16 }}>
        <p className="muted">
          Beta placeholder. This page must be reviewed by counsel before public launch or accepting payments. Before
          launch, include:
        </p>
        <ul>
          <li>Acceptable use (no spam, no abuse)</li>
          <li>No circumvention: no CAPTCHA/paywall/login bypassing</li>
          <li>User-controlled submission (no auto-submit)</li>
          <li>Accuracy expectations (no fabricated claims)</li>
          <li>Beta disclaimer</li>
        </ul>
        <p className="muted">Questions: support@example.com</p>
      </div>
    </div>
  );
}
