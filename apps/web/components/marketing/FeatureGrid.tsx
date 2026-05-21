import { BoltIcon, ChartIcon, DocIcon, PuzzleIcon, ShieldIcon, SparkIcon } from "./icons";

const FEATURES = [
  { title: "Save hours applying", desc: "Autofill repetitive fields from approved profile facts.", icon: BoltIcon },
  { title: "Tailor every application", desc: "Generate cover letters you can edit before using.", icon: SparkIcon },
  { title: "Avoid repetitive forms", desc: "ATS-aware field detection with conservative mapping.", icon: PuzzleIcon },
  { title: "Track jobs in one dashboard", desc: "Status, follow-up dates, notes, and audit history.", icon: ChartIcon },
  { title: "Export to Excel", desc: "Clean `.xlsx` tracker with filters and frozen headers.", icon: DocIcon },
  { title: "Stay in control", desc: "Sensitive questions are always reviewed by you.", icon: ShieldIcon }
];

export function FeatureGrid() {
  return (
    <section className="mkSection">
      <div className="mkSectionHead">
        <h2 className="mkH2">Built for speed and credibility</h2>
        <p className="mkMuted">Everything is designed around review-first automation and clear provenance.</p>
      </div>
      <div className="mkGrid3">
        {FEATURES.map((f) => (
          <div key={f.title} className="mkCard mkCardHover">
            <div className="mkIconWrap">
              <f.icon />
            </div>
            <div className="mkCardTitle">{f.title}</div>
            <div className="mkMuted">{f.desc}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

