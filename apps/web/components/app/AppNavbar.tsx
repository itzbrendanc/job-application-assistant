import Link from "next/link";
import { HirelyLogo } from "../brand/HirelyLogo";

type NavId = "dashboard" | "applications" | "documents" | "job-sites" | "pricing";

export function AppNavbar({ active }: { active: NavId }) {
  const items: Array<{ id: NavId; label: string; href: string }> = [
    { id: "dashboard", label: "Dashboard", href: "/dashboard" },
    { id: "applications", label: "Applications", href: "/applications" },
    { id: "documents", label: "Documents", href: "/documents/cover-letter" },
    { id: "job-sites", label: "Job Sites", href: "/job-sites" },
    { id: "pricing", label: "Pricing", href: "/pricing" }
  ];

  return (
    <header className="appNav" aria-label="App navigation">
      <div className="appNavInner">
        <div className="appNavLeft">
          <HirelyLogo href="/" />
        </div>

        <nav className="appNavLinks" aria-label="Primary">
          {items.map((it) => (
            <Link
              key={it.id}
              href={it.href}
              className={`appNavLink ${active === it.id ? "appNavLinkActive" : ""}`}
            >
              {it.label}
            </Link>
          ))}
        </nav>

        <div className="appNavRight">
          <Link className="appNavCta" href="/download">
            <span className="appNavCtaIcon" aria-hidden>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 4v7m0 0 3-3m-3 3-3-3M5 14v5h14v-5"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            Install Extension
          </Link>

          <button className="appNavIconBtn" type="button" aria-label="Notifications">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M18 9a6 6 0 1 0-12 0c0 7-3 7-3 7h18s-3 0-3-7Z"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
              <path
                d="M13.7 20a2 2 0 0 1-3.4 0"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </button>

          <button className="appNavUser" type="button" aria-label="User menu">
            <span className="appNavUserAvatar" aria-hidden>
              BC
            </span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
