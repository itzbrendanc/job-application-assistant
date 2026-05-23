import { ChartIcon, DocIcon, ShieldIcon, SparkIcon } from "./icons";

function Pill({ children }: { children: React.ReactNode }) {
  return <span className="mkPill">{children}</span>;
}

export function ProductMockup() {
  return (
    <div className="mkMockWrap" aria-label="Product mockups">
      <div className="mkMockGrid">
        <div className="mkMockCard">
          <div className="mkMockHead">
            <div className="mkMockTitle">
              <SparkIcon />
              Extension Side Panel
            </div>
            <Pill>Detected on Greenhouse</Pill>
          </div>
          <div className="mkMockBody">
            <div className="mkMockRow">
              <div className="mkMockStat">
                <div className="mkMockStatK">Match score</div>
                <div className="mkMockStatV">86%</div>
              </div>
              <div className="mkMockStat">
                <div className="mkMockStatK">Fields detected</div>
                <div className="mkMockStatV">24</div>
              </div>
            </div>
            <div className="mkMockList">
              <div className="mkMockItem">
                <span className="mkDot mkDotOk" /> Email <span className="mkMuted">high confidence</span>
              </div>
              <div className="mkMockItem">
                <span className="mkDot mkDotOk" /> Phone <span className="mkMuted">high confidence</span>
              </div>
              <div className="mkMockItem">
                <span className="mkDot mkDotWarn" /> Salary expectations <span className="mkMuted">asks you</span>
              </div>
              <div className="mkMockItem">
                <span className="mkDot mkDotWarn" /> Work authorization <span className="mkMuted">asks you</span>
              </div>
              <div className="mkMockItem">
                <span className="mkDot mkDotWarn" /> EEO questions <span className="mkMuted">never auto-answered</span>
              </div>
            </div>
            <div className="mkMockActions">
              <button className="mkBtn mkBtnPrimary" type="button">
                Fill approved fields
              </button>
              <button className="mkBtn mkBtnGhost" type="button">
                Record to tracker
              </button>
            </div>
            <div className="mkMockNote">
              <ShieldIcon /> Never auto-submits. You click submit on the site.
            </div>
          </div>
        </div>

        <div className="mkMockCard">
          <div className="mkMockHead">
            <div className="mkMockTitle">
              <ChartIcon />
              Dashboard Tracker
            </div>
            <Pill>Excel-ready</Pill>
          </div>
          <div className="mkMockBody">
            <div className="mkMockTable" role="table" aria-label="Tracker preview">
              <div className="mkMockTr mkMockTh" role="row">
                <div role="columnheader">Company</div>
                <div role="columnheader">Role</div>
                <div role="columnheader">Status</div>
              </div>
              <div className="mkMockTr" role="row">
                <div role="cell">ExampleCo</div>
                <div role="cell">Backend Engineer</div>
                <div role="cell">
                  <span className="mkChip">applied</span>
                </div>
              </div>
              <div className="mkMockTr" role="row">
                <div role="cell">Northwind</div>
                <div role="cell">Full Stack</div>
                <div role="cell">
                  <span className="mkChip">ready_for_review</span>
                </div>
              </div>
            </div>
            <div className="mkMockRow" style={{ marginTop: 10 }}>
              <div className="mkMockMini">
                <DocIcon />
                <div>
                  <div className="mkMockMiniT">Cover letter</div>
                  <div className="mkMuted">Editable, sourced to your facts</div>
                </div>
              </div>
              <div className="mkMockMini">
                <ShieldIcon />
                <div>
                  <div className="mkMockMiniT">Audit log</div>
                  <div className="mkMuted">Every sensitive action</div>
                </div>
              </div>
            </div>
            <div className="mkMockNote">
              <SparkIcon /> Generate tailored documents using approved facts only.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
