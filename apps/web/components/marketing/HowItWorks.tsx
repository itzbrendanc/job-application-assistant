import { BoltIcon, DocIcon, ShieldIcon, SparkIcon } from "./icons";

const STEPS = [
  { t: "Upload your resume", d: "Review extracted facts and approve what’s accurate.", icon: DocIcon },
  { t: "Visit job sites", d: "The extension detects application forms and fields.", icon: SparkIcon },
  { t: "Fill approved fields", d: "Autofill only what you approved. Sensitive questions pause.", icon: ShieldIcon },
  { t: "Review and submit", d: "You stay in control. The extension never clicks submit.", icon: ShieldIcon },
  { t: "Track everything", d: "Applications, statuses, follow-ups, notes, and Excel export.", icon: BoltIcon }
];

export function HowItWorks() {
  return (
    <section className="mkSection" id="how-it-works">
      <div className="mkSectionHead">
        <h2 className="mkH2">How it works</h2>
        <p className="mkMuted">A guided workflow across the web dashboard and Chrome extension.</p>
      </div>
      <div className="mkSteps">
        {STEPS.map((s, idx) => (
          <div className="mkStep" key={s.t}>
            <div className="mkStepNum">{idx + 1}</div>
            <div className="mkStepBody">
              <div className="mkStepTitle">
                <s.icon /> {s.t}
              </div>
              <div className="mkMuted">{s.d}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
