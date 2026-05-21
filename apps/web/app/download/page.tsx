import Link from "next/link";

import { CTASection } from "../../components/marketing/CTASection";
import { FAQSection } from "../../components/marketing/FAQSection";
import { Footer } from "../../components/marketing/Footer";
import { MarketingNavbar } from "../../components/marketing/MarketingNavbar";
import { SupportedSites } from "../../components/marketing/SupportedSites";

export const metadata = {
  title: "Download | Job Application Assistant",
  description:
    "Install the Chrome extension and use a review-first application workflow. User-controlled submission and no CAPTCHA bypassing."
};

export default function DownloadPage() {
  return (
    <>
      <MarketingNavbar />
      <main>
        <section className="mkSection" style={{ paddingTop: 26 }}>
          <div className="mkCard">
            <h1 className="mkH1" style={{ margin: 0 }}>
              Install the Chrome extension
            </h1>
            <p className="mkLead" style={{ marginTop: 10 }}>
              A review-first workflow that helps you fill applications faster while you stay in control.
            </p>
            <div className="mkHeroCtas">
              <Link className="mkBtn mkBtnPrimary mkBtnLg" href="/pricing">
                Start free
              </Link>
              <Link className="mkBtn mkBtnGhost mkBtnLg" href="/dashboard">
                Get Started
              </Link>
            </div>
            <div className="mkWarn" style={{ marginTop: 14 }}>
              Positioned as an AI job application copilot: it helps you review and fill approved fields, but submission is
              always user-controlled. It never bypasses CAPTCHAs or login protections.
            </div>
          </div>
        </section>

        <section className="mkSection">
          <div className="mkSectionHead">
            <h2 className="mkH2">Chrome Web Store</h2>
            <p className="mkMuted">When published, install from the Chrome Web Store for automatic updates.</p>
          </div>
          <div className="mkCard">
            <div className="mkMuted">
              Coming soon. For now, use the beta developer install below.
            </div>
          </div>
        </section>

        <section className="mkSection">
          <div className="mkSectionHead">
            <h2 className="mkH2">Beta developer install</h2>
            <p className="mkMuted">Build and load the unpacked extension locally.</p>
          </div>
          <div className="mkCard">
            <pre style={{ whiteSpace: "pre-wrap", margin: 0 }}>{`npm run build -w apps/extension
chrome://extensions → Developer mode → Load unpacked → apps/extension/dist`}</pre>
          </div>
        </section>

        <section className="mkSection">
          <div className="mkSectionHead">
            <h2 className="mkH2">Permissions (transparent)</h2>
            <p className="mkMuted">We request only what’s needed for the workflow.</p>
          </div>
          <div className="mkGrid3">
            <div className="mkCard">
              <div style={{ fontWeight: 800 }}>Active tab + scripting</div>
              <div className="mkMuted" style={{ marginTop: 6 }}>
                Detect fields and fill values you approve on the current page only.
              </div>
            </div>
            <div className="mkCard">
              <div style={{ fontWeight: 800 }}>Side panel</div>
              <div className="mkMuted" style={{ marginTop: 6 }}>
                A first-class UI to review suggestions, edit answers, and control fill actions.
              </div>
            </div>
            <div className="mkCard">
              <div style={{ fontWeight: 800 }}>Downloads</div>
              <div className="mkMuted" style={{ marginTop: 6 }}>
                Export your application tracker to Excel (`.xlsx`) on demand.
              </div>
            </div>
          </div>
          <div className="mkOk" style={{ marginTop: 12 }}>
            Security guarantees: no auto-submit, no CAPTCHA bypassing, no hidden automation, and no fabricated experience.
          </div>
        </section>

        <SupportedSites />
        <FAQSection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
