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
        </div>
      </div>
    </header>
  );
}

