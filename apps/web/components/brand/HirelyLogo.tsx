import Link from "next/link";

type HirelyLogoProps = {
  href?: string;
  size?: number;
  showWordmark?: boolean;
  showTagline?: boolean;
  className?: string;
};

export function HirelyLogo({
  href,
  size = 30,
  showWordmark = true,
  showTagline = false,
  className
}: HirelyLogoProps) {
  const content = (
    <span className={className ?? "hyBrand"}>
      <HirelyMark size={size} />
      {showWordmark ? (
        <span className="hyWordmark">
          <span className="hyName">Hirely</span>
          {showTagline ? <span className="hyTagline">Smart applications. Better opportunities.</span> : null}
        </span>
      ) : null}
    </span>
  );

  if (href) return <Link href={href} aria-label="Hirely home">{content}</Link>;
  return content;
}

export function HirelyMark({ size = 30 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      role="img"
      aria-label="Hirely logo"
    >
      <defs>
        <linearGradient id="hyStroke" x1="6" y1="6" x2="28" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6D5BFF" />
          <stop offset="1" stopColor="#B14CFF" />
        </linearGradient>
        <filter id="hyGlow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="1.6" result="blur" />
          <feColorMatrix
            in="blur"
            type="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.55 0"
          />
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Document outline with folded corner */}
      <path
        d="M10.2 6.6h8.6l3.9 3.9v14.8c0 1.3-1 2.3-2.3 2.3H10.2c-1.3 0-2.3-1-2.3-2.3V8.9c0-1.3 1-2.3 2.3-2.3Z"
        stroke="url(#hyStroke)"
        strokeWidth="1.8"
        strokeLinejoin="round"
        filter="url(#hyGlow)"
      />
      <path
        d="M18.8 6.6v4.1c0 .7.5 1.2 1.2 1.2h4.1"
        stroke="url(#hyStroke)"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />

      {/* Checkmark */}
      <path
        d="M12.0 18.0l2.6 2.6 5.8-6.3"
        stroke="url(#hyStroke)"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Subtle "page action" arrow detail */}
      <path
        d="M13.2 23.4h7.6m0 0-2.2-2.2m2.2 2.2-2.2 2.2"
        stroke="rgba(255,255,255,0.45)"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

