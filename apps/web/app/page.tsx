import { CTASection } from "../components/marketing/CTASection";
import { FAQSection } from "../components/marketing/FAQSection";
import { FeatureGrid } from "../components/marketing/FeatureGrid";
import { Footer } from "../components/marketing/Footer";
import { HeroSection } from "../components/marketing/HeroSection";
import { HowItWorks } from "../components/marketing/HowItWorks";
import { MarketingNavbar } from "../components/marketing/MarketingNavbar";
import { SupportedSites } from "../components/marketing/SupportedSites";
import { TrustSection } from "../components/marketing/TrustSection";

export const metadata = {
  title: "Hirely | AI Job Application Copilot",
  description:
    "Autofill job applications, tailor cover letters, and track every opportunity — while you stay in control."
};

export default function HomePage() {
  return (
    <>
      {/* Marketing pages are intentionally separate from the dashboard experience. */}
      <MarketingNavbar />
      <main>
        <HeroSection />
        <FeatureGrid />
        <HowItWorks />
        <TrustSection />
        <SupportedSites />
        <Testimonials />
        <CTASection />
        <FAQSection />
      </main>
      <Footer />
    </>
  );
}

function Testimonials() {
  return (
    <section className="mkSection">
      <div className="mkSectionHead">
        <h2 className="mkH2">Testimonials</h2>
        <p className="mkMuted">Placeholder — add real user quotes before launch.</p>
      </div>
      <div className="mkGrid3">
        <div className="mkCard">
          <div className="mkMuted">“This would be a quote about saving time while staying accurate.”</div>
          <div style={{ marginTop: 10, fontWeight: 780 }}>Early user</div>
          <div className="mkMuted">Software Engineer</div>
        </div>
        <div className="mkCard">
          <div className="mkMuted">“This would be a quote about the extension workflow and review steps.”</div>
          <div style={{ marginTop: 10, fontWeight: 780 }}>Beta tester</div>
          <div className="mkMuted">Student</div>
        </div>
        <div className="mkCard">
          <div className="mkMuted">“This would be a quote about trust: no auto-submit and no fabricated claims.”</div>
          <div style={{ marginTop: 10, fontWeight: 780 }}>Career switcher</div>
          <div className="mkMuted">Analyst</div>
        </div>
      </div>
    </section>
  );
}
