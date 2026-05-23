import Link from "next/link";
import { HirelyLogo } from "../brand/HirelyLogo";

export function Footer() {
  return (
    <footer className="mkFooter">
      <div className="mkFooterInner">
        <div className="mkFooterTop">
          <div>
            <div className="mkFooterBrand">
              <HirelyLogo href="/" showTagline />
            </div>
            <div className="mkMuted" style={{ marginTop: 6 }}>
              A trustworthy AI job application copilot. Review-first autofill with user-controlled submission.
            </div>
            <div className="mkMuted" style={{ marginTop: 10 }}>
              Support: <a href="mailto:support@example.com">support@example.com</a>
            </div>
          </div>
          <div className="mkFooterCols">
            <div className="mkFooterCol">
              <div className="mkFooterColTitle">Product</div>
              <Link href="/pricing">Pricing</Link>
              <Link href="/download">Download</Link>
              <Link href="/dashboard">Dashboard</Link>
            </div>
            <div className="mkFooterCol">
              <div className="mkFooterColTitle">Trust</div>
              <Link href="/privacy">Privacy</Link>
              <Link href="/terms">Terms</Link>
              <Link href="/contact">Contact</Link>
              <Link href="/feedback">Feedback</Link>
            </div>
          </div>
        </div>
        <div className="mkFooterBottom">
          <div className="mkMuted">© {new Date().getFullYear()} Hirely</div>
          <div className="mkMuted">No auto-submit. No CAPTCHA bypassing. No fabricated experience.</div>
        </div>
      </div>
    </footer>
  );
}
