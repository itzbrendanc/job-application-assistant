import { siGlassdoor, siGreenhouse, siHandshake, siIndeed } from "simple-icons/icons";

type PlatformId =
  | "linkedin"
  | "indeed"
  | "glassdoor"
  | "handshake"
  | "greenhouse"
  | "lever"
  | "workday"
  | "ashby"
  | "smartrecruiters";

type Variant = "mono" | "brand";

function LinkedInBrand({ size = 44 }: { size?: number }) {
  // Simple, recognizable mark: blue tile with white "in"
  return (
    <svg className="jsLogo" width={size} height={size} viewBox="0 0 64 64" role="img" aria-label="LinkedIn logo">
      <rect x="6" y="6" width="52" height="52" rx="14" fill="#0A66C2" />
      <path
        d="M22.5 27.4h6.1v20.1h-6.1V27.4Zm3-9.2a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7ZM32 27.4h5.9v2.7h.1c.8-1.6 2.8-3.3 5.9-3.3 6.3 0 7.5 4.1 7.5 9.5v11.2h-6.1V37.6c0-2.4 0-5.5-3.4-5.5-3.4 0-3.9 2.6-3.9 5.3v10.1H32V27.4Z"
        fill="#ffffff"
      />
    </svg>
  );
}

function SmartRecruitersBrand({ size = 44 }: { size?: number }) {
  return (
    <svg className="jsLogo" width={size} height={size} viewBox="0 0 64 64" role="img" aria-label="SmartRecruiters logo">
      <defs>
        <linearGradient id="srG" x1="10" y1="10" x2="58" y2="58" gradientUnits="userSpaceOnUse">
          <stop stopColor="#22C55E" />
          <stop offset="1" stopColor="#16A34A" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="26" fill="url(#srG)" />
      <path
        d="M40.9 25.2c-1.4-1.7-3.7-2.8-6.8-2.8-4 0-7.2 1.8-7.2 5.1 0 3.2 2.8 4.3 6.4 5.1 3.1.7 4.4 1.2 4.4 2.4 0 1.2-1.4 1.9-3.7 1.9-2.2 0-4.2-.8-5.6-2.2l-3 3.1c1.9 2.2 5.1 3.4 8.8 3.4 4.7 0 7.9-2 7.9-5.5 0-3.4-2.8-4.5-6.9-5.3-2.9-.6-3.9-1-3.9-2.1 0-1 1.2-1.6 3.1-1.6 1.8 0 3.5.6 4.5 1.7l3-3.2Z"
        fill="#ffffff"
        opacity="0.92"
      />
    </svg>
  );
}

function WorkdayBrand({ size = 44 }: { size?: number }) {
  return (
    <svg className="jsLogo" width={size} height={size} viewBox="0 0 64 64" role="img" aria-label="Workday logo">
      <defs>
        <linearGradient id="wdBlue" x1="18" y1="18" x2="46" y2="46" gradientUnits="userSpaceOnUse">
          <stop stopColor="#40A9FF" />
          <stop offset="1" stopColor="#1D4ED8" />
        </linearGradient>
      </defs>
      <path
        d="M18 22v24h6.2V30.9L32 43.8l7.8-12.9V46H46V22h-6.5L32 34.6 24.5 22H18Z"
        fill="url(#wdBlue)"
      />
      <path
        d="M22 18c4-3 7.5-4.4 10-4.4S38 15 42 18"
        stroke="#F59E0B"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function LeverBrand({ size = 44 }: { size?: number }) {
  return (
    <svg className="jsLogo" width={size} height={size} viewBox="0 0 64 64" role="img" aria-label="Lever logo">
      <defs>
        <linearGradient id="lvG" x1="12" y1="14" x2="52" y2="52" gradientUnits="userSpaceOnUse">
          <stop stopColor="#E5E7EB" />
          <stop offset="1" stopColor="#9CA3AF" />
        </linearGradient>
      </defs>
      <path
        d="M18 46 42.5 21.5c1.1-1.1 2.6-1.7 4.2-1.7H50v3.3c0 1.6-.6 3.1-1.7 4.2L23.8 52H18v-6Z"
        fill="url(#lvG)"
      />
      <path d="M18 46h6v6h-6v-6Z" fill="#D1D5DB" />
    </svg>
  );
}

function AshbyBrand({ size = 44 }: { size?: number }) {
  return (
    <svg className="jsLogo" width={size} height={size} viewBox="0 0 64 64" role="img" aria-label="Ashby logo">
      <defs>
        <linearGradient id="ashG" x1="14" y1="16" x2="52" y2="54" gradientUnits="userSpaceOnUse">
          <stop stopColor="#A855F7" />
          <stop offset="1" stopColor="#7C3AED" />
        </linearGradient>
      </defs>
      <path
        d="M34.9 18 50 52h-6.6l-3-7.1H23.6l-3 7.1H14L29.1 18h5.8Zm-9.1 22h12.4L32 24.6 25.8 40Z"
        fill="url(#ashG)"
      />
    </svg>
  );
}

function SimpleIcon({
  title,
  path,
  hex,
  size = 34,
  variant
}: {
  title: string;
  path: string;
  hex?: string;
  size?: number;
  variant: Variant;
}) {
  const color = variant === "brand" && hex ? `#${hex}` : "currentColor";
  return (
    <svg
      className="jsLogo"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      role="img"
      aria-label={`${title} logo`}
      fill="none"
    >
      <path d={path} fill={color} />
    </svg>
  );
}

function Monogram({
  label,
  text,
  size = 34
}: {
  label: string;
  text: string;
  size?: number;
}) {
  return (
    <svg
      className="jsLogo"
      width={size}
      height={size}
      viewBox="0 0 64 64"
      role="img"
      aria-label={`${label} logo`}
      fill="none"
    >
      <defs>
        <linearGradient id="monoG" x1="10" y1="10" x2="58" y2="58" gradientUnits="userSpaceOnUse">
          <stop stopColor="rgba(109, 91, 255, 0.9)" />
          <stop offset="1" stopColor="rgba(102, 227, 255, 0.85)" />
        </linearGradient>
      </defs>
      <rect x="6" y="6" width="52" height="52" rx="14" stroke="rgba(255,255,255,0.16)" />
      <rect x="6" y="6" width="52" height="52" rx="14" fill="rgba(0,0,0,0.12)" />
      <text
        x="32"
        y="38"
        textAnchor="middle"
        fontSize={text.length <= 2 ? 22 : 18}
        fontWeight={820}
        fill="url(#monoG)"
        fontFamily="ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial"
      >
        {text}
      </text>
    </svg>
  );
}

export function PlatformLogo({
  id,
  size = 34,
  variant = "mono"
}: {
  id: PlatformId;
  size?: number;
  variant?: Variant;
}) {
  switch (id) {
    case "indeed":
      return <SimpleIcon title={siIndeed.title} path={siIndeed.path} hex={siIndeed.hex} size={size} variant={variant} />;
    case "glassdoor":
      return (
        <SimpleIcon
          title={siGlassdoor.title}
          path={siGlassdoor.path}
          hex={siGlassdoor.hex}
          size={size}
          variant={variant}
        />
      );
    case "handshake":
      return (
        <SimpleIcon
          title={siHandshake.title}
          path={siHandshake.path}
          hex={siHandshake.hex}
          size={size}
          variant={variant}
        />
      );
    case "greenhouse":
      return (
        <SimpleIcon
          title={siGreenhouse.title}
          path={siGreenhouse.path}
          hex={siGreenhouse.hex}
          size={size}
          variant={variant}
        />
      );

    // Not available in simple-icons (or not reliably exported in this version): use a clean monogram fallback.
    case "linkedin":
      return variant === "brand" ? <LinkedInBrand size={size} /> : <Monogram label="LinkedIn" text="in" size={size} />;
    case "lever":
      return variant === "brand" ? <LeverBrand size={size} /> : <Monogram label="Lever" text="L" size={size} />;
    case "workday":
      return variant === "brand" ? <WorkdayBrand size={size} /> : <Monogram label="Workday" text="W" size={size} />;
    case "ashby":
      return variant === "brand" ? <AshbyBrand size={size} /> : <Monogram label="Ashby" text="A" size={size} />;
    case "smartrecruiters":
      return variant === "brand" ? <SmartRecruitersBrand size={size} /> : <Monogram label="SmartRecruiters" text="SR" size={size} />;
    default:
      return <Monogram label="Platform" text="•" size={size} />;
  }
}
