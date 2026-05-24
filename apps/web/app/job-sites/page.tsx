import { Footer } from "../../components/marketing/Footer";
import Link from "next/link";
import { AppNavbar } from "../../components/app/AppNavbar";
import { JobSitesHubClient } from "./ui";

export const metadata = {
  title: "Job Sites | Hirely",
  description:
    "Quickly open major job platforms and use Hirely’s review-first extension workflow. No passwords collected, no CAPTCHA bypassing."
};

export default function JobSitesPage() {
  return (
    <>
      <AppNavbar active="job-sites" />
      <main>
        <JobSitesHubClient />
        <TrustStrip />
      </main>
      <Footer />
    </>
  );
}

function TrustStrip() {
  return (
    <section className="jsPage" style={{ paddingTop: 10, paddingBottom: 30 }}>
      <div className="jsTrustStrip">
        <div className="jsTrustHuge" aria-hidden>
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2.5l7 3.1v6.3c0 5-3 8.7-7 9.6-4-1-7-4.6-7-9.6V5.6l7-3.1Z"
              stroke="currentColor"
              strokeWidth="1.4"
            />
            <path d="M8.2 12.1l2.3 2.3 5.3-5.3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        </div>

        <div className="jsTrustMid">
          <div className="jsTrustTitle">Your security & trust are our priority</div>
          <div className="jsTrustRow" aria-label="Trust guarantees">
            <TrustItem title="We never ask for your passwords.">Sign in directly on each job site.</TrustItem>
            <TrustItem title="You review everything before submitting.">Hirely fills what you approve.</TrustItem>
            <TrustItem title="No fabricated experience.">We only use your approved facts.</TrustItem>
            <TrustItem title="No CAPTCHA bypassing.">Never.</TrustItem>
            <TrustItem title="Use the Hirely extension after opening the site.">That’s where it works.</TrustItem>
          </div>
        </div>

        <div className="jsTrustRight">
          <Link className="aiButton aiButtonPrimary" href="/download">
            Install Extension
          </Link>
          <Link className="jsTrustLink" href="/#how-it-works">
            Learn how it works <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

function TrustItem({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="jsTrustItem">
      <div>
        <div className="jsTrustItemT">{title}</div>
        <div className="jsTrustItemD">{children}</div>
      </div>
    </div>
  );
}
