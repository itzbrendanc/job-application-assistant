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
      return <Monogram label="LinkedIn" text="in" size={size} />;
    case "lever":
      return <Monogram label="Lever" text="L" size={size} />;
    case "workday":
      return <Monogram label="Workday" text="W" size={size} />;
    case "ashby":
      return <Monogram label="Ashby" text="A" size={size} />;
    case "smartrecruiters":
      return <Monogram label="SmartRecruiters" text="SR" size={size} />;
    default:
      return <Monogram label="Platform" text="•" size={size} />;
  }
}
