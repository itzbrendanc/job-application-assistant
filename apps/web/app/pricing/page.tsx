import { CTASection } from "../../components/marketing/CTASection";
import { FAQSection } from "../../components/marketing/FAQSection";
import { Footer } from "../../components/marketing/Footer";
import { MarketingNavbar } from "../../components/marketing/MarketingNavbar";
import { PricingCards } from "../../components/marketing/PricingCards";

export const metadata = {
  title: "Pricing | Job Application Assistant",
  description: "Start free, then upgrade to Pro for unlimited tracker, extension autofill, cover letters, and Excel export."
};

export default function PricingPage() {
  return (
    <>
      <MarketingNavbar />
      <main>
        <div className="mkSection" style={{ paddingTop: 26 }}>
          <PricingCards />
        </div>
        <PlanCompare />
        <FAQSection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}

function PlanCompare() {
  const rows = [
    { k: "Tracked applications / month", free: "10", pro: "Unlimited" },
    { k: "Extension autofill (approved fields)", free: "Limited", pro: "Included" },
    { k: "Tailored cover letters (editable)", free: "Limited", pro: "Included" },
    { k: "Excel export", free: "Limited", pro: "Included" },
    { k: "Dashboard tracker", free: "Included", pro: "Included" }
  ];
  return (
    <section className="mkSection">
      <div className="mkSectionHead">
        <h2 className="mkH2">Plan comparison</h2>
        <p className="mkMuted">Clear boundaries, no surprise automation.</p>
      </div>
      <div className="mkCard">
        <div style={{ display: "grid", gap: 8 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.6fr 0.7fr 0.7fr",
              gap: 10,
              color: "var(--muted)",
              fontSize: 12,
              paddingBottom: 8,
              borderBottom: "1px solid rgba(255,255,255,0.08)"
            }}
          >
            <div>Feature</div>
            <div>Free</div>
            <div>Pro</div>
          </div>
          {rows.map((r) => (
            <div
              key={r.k}
              style={{
                display: "grid",
                gridTemplateColumns: "1.6fr 0.7fr 0.7fr",
                gap: 10,
                padding: "8px 0",
                borderBottom: "1px solid rgba(255,255,255,0.06)"
              }}
            >
              <div style={{ fontWeight: 700 }}>{r.k}</div>
              <div className="mkMuted">{r.free}</div>
              <div className="mkMuted">{r.pro}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
