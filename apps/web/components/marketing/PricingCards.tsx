"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiFetch, getToken } from "../../app/lib/api";
import { track } from "../../lib/analytics";

function Card({
  title,
  price,
  badge,
  bullets,
  ctaLabel,
  onCta,
  subtle
}: {
  title: string;
  price: string;
  badge?: string;
  bullets: string[];
  ctaLabel: string;
  onCta?: () => void;
  subtle?: boolean;
}) {
  return (
    <div className={`mkPriceCard ${subtle ? "mkPriceCardSubtle" : ""}`}>
      <div className="mkPriceHead">
        <div className="mkPriceTitle">
          {title} {badge ? <span className="mkBest">{badge}</span> : null}
        </div>
        <div className="mkPrice">{price}</div>
      </div>
      <div className="mkPriceList">
        {bullets.map((b) => (
          <div className="mkPriceItem" key={b}>
            <span className="mkCheck" aria-hidden />
            <span>{b}</span>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 14 }}>
        {onCta ? (
          <button className="mkBtn mkBtnPrimary mkBtnLg" type="button" onClick={onCta}>
            {ctaLabel}
          </button>
        ) : (
          <Link className="mkBtn mkBtnPrimary mkBtnLg" href="/dashboard">
            {ctaLabel}
          </Link>
        )}
      </div>
    </div>
  );
}

export function PricingCards() {
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<any>(null);

  useEffect(() => {
    (async () => {
      if (!getToken()) return;
      try {
        setStatus(await apiFetch("/api/billing/status"));
      } catch {
        // ignore
      }
    })();
  }, []);

  async function checkout(plan: "pro_monthly" | "pro_annual") {
    setError(null);
    if (!getToken()) {
      setError("Sign in first from Dashboard to upgrade.");
      return;
    }
    await track("checkout_started", { plan });
    setBusy(plan);
    try {
      const res = await apiFetch<{ url: string }>("/api/billing/checkout", {
        method: "POST",
        body: JSON.stringify({
          plan,
          success_url: (process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin) + "/account/billing",
          cancel_url: (process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin) + "/pricing"
        })
      });
      window.location.href = res.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Checkout failed");
      setBusy(null);
    }
  }

  return (
    <section className="mkSection">
      <div className="mkSectionHead">
        <h1 className="mkH1" style={{ margin: 0 }}>
          Pricing
        </h1>
        <p className="mkMuted">
          Built as a copilot: you review and personally submit. Pro unlocks unlimited usage.
        </p>
        {status ? <div className="mkMuted">Current plan: {status.plan}</div> : null}
        {error ? <div className="mkWarn">{error}</div> : null}
      </div>

      <div className="mkPriceGrid">
        <Card
          title="Free"
          price="10 applications / month"
          bullets={["Basic tracker", "Limited autofill workflow", "Upgrade any time"]}
          ctaLabel="Start free"
        />
        <Card
          title="Pro Monthly"
          price="Unlimited"
          bullets={["Unlimited applications", "Extension autofill (approved fields)", "Tailored cover letters", "Excel export", "Application dashboard"]}
          ctaLabel={busy === "pro_monthly" ? "Redirecting…" : "Upgrade to Pro Monthly"}
          onCta={() => checkout("pro_monthly")}
        />
        <Card
          title="Pro Annual"
          price="Best value"
          badge="Best value"
          bullets={["Everything in Pro", "Discounted yearly pricing", "Priority roadmap influence"]}
          ctaLabel={busy === "pro_annual" ? "Redirecting…" : "Upgrade to Pro Annual"}
          onCta={() => checkout("pro_annual")}
          subtle
        />
      </div>
    </section>
  );
}
