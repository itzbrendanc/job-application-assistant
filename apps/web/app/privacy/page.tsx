import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="container">
      <div className="nav">
        <div className="brand">
          <Link href="/">Job Application Assistant</Link>
          <span className="badge">Privacy</span>
        </div>
        <div className="row">
          <Link href="/terms">Terms</Link>
          <Link href="/download">Download</Link>
        </div>
      </div>
      <h1 className="h1">Privacy</h1>
      <div className="card" style={{ marginTop: 16 }}>
        <p className="muted">
          Beta placeholder. This page must be reviewed by counsel before public launch or accepting payments. Before
          launch, expand this page with clear disclosures:
        </p>
        <ul>
          <li>What data you provide (resume/profile/application tracker)</li>
          <li>What the extension reads (form fields on the active page)</li>
          <li>What is sent where (only on user actions, to the configured API)</li>
          <li>Retention and deletion/export options</li>
          <li>Audit logs for sensitive actions</li>
        </ul>
        <p className="muted">Questions: support@example.com</p>
      </div>
    </div>
  );
}
