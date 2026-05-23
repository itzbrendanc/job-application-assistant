import Link from "next/link";
import { HirelyLogo } from "../brand/HirelyLogo";
import { ShieldIcon } from "../marketing/icons";

export function AuthShell({
  titleBadge,
  title,
  subtitle,
  children
}: {
  titleBadge: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="authWrap">
      <div className="authShell">
        <section className="authBrandPanel" aria-label="Hirely brand panel">
          <div className="authTopRow">
            <HirelyLogo href="/" showTagline />
            <span className="badge">{titleBadge}</span>
          </div>

          <div className="authBrandTitle">{title}</div>
          <div className="muted" style={{ marginTop: 6 }}>
            {subtitle}
          </div>

          <div className="authBullets" aria-label="Trust bullets">
            <div className="authBullet">
              <ShieldIcon /> <span>Review-first autofill with user-controlled submission.</span>
            </div>
            <div className="authBullet">
              <ShieldIcon /> <span>No fabricated experience. AI outputs are editable and sourced to your facts.</span>
            </div>
            <div className="authBullet">
              <ShieldIcon /> <span>No CAPTCHA bypassing. No login circumvention. No hidden automation.</span>
            </div>
          </div>

          <div className="muted" style={{ marginTop: 14 }}>
            <Link href="/pricing">View pricing</Link> · <Link href="/download">Extension install</Link>
          </div>
        </section>

        <section className="authFormPanel" aria-label="Authentication form">
          <div className="authFormCard">{children}</div>
        </section>
      </div>
    </div>
  );
}

