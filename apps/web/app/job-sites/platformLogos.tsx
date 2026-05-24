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

function SimpleIcon({ title, path, size = 34 }: { title: string; path: string; size?: number }) {
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
      <path d={path} fill="currentColor" />
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
      <rect x="6" y="6" width="52" height="52" rx="14" stroke="rgba(255,255,255,0.18)" />
      <text
        x="32"
        y="38"
        textAnchor="middle"
        fontSize={text.length <= 2 ? 22 : 18}
        fontWeight={820}
        fill="currentColor"
        fontFamily="ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial"
      >
        {text}
      </text>
    </svg>
  );
}

export function PlatformLogo({ id, size = 34 }: { id: PlatformId; size?: number }) {
  switch (id) {
    case "indeed":
      return <SimpleIcon title={siIndeed.title} path={siIndeed.path} size={size} />;
    case "glassdoor":
      return <SimpleIcon title={siGlassdoor.title} path={siGlassdoor.path} size={size} />;
    case "handshake":
      return <SimpleIcon title={siHandshake.title} path={siHandshake.path} size={size} />;
    case "greenhouse":
      return <SimpleIcon title={siGreenhouse.title} path={siGreenhouse.path} size={size} />;

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

