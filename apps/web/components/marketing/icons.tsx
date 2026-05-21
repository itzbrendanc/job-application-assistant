import React from "react";

type IconProps = { size?: number; className?: string; title?: string };

function baseProps(size: number, title?: string) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    "aria-hidden": title ? undefined : true,
    role: title ? "img" : undefined
  } as const;
}

export function SparkIcon({ size = 20, className, title }: IconProps) {
  return (
    <svg {...baseProps(size, title)} className={className}>
      {title ? <title>{title}</title> : null}
      <path
        d="M12 2l1.2 5.1L18 8.4l-4.8 1.3L12 15l-1.2-5.3L6 8.4l4.8-1.3L12 2Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M19 12l.6 2.6L22 15.2l-2.4.7L19 18l-.6-2.1L16 15.2l2.4-.6L19 12Z"
        stroke="currentColor"
        strokeWidth="1.6"
        opacity="0.8"
      />
    </svg>
  );
}

export function ShieldIcon({ size = 20, className, title }: IconProps) {
  return (
    <svg {...baseProps(size, title)} className={className}>
      {title ? <title>{title}</title> : null}
      <path
        d="M12 2.5l7 3.1v6.3c0 5-3 8.7-7 9.6-4-1-7-4.6-7-9.6V5.6l7-3.1Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path d="M8.2 12.1l2.3 2.3 5.3-5.3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function BoltIcon({ size = 20, className, title }: IconProps) {
  return (
    <svg {...baseProps(size, title)} className={className}>
      {title ? <title>{title}</title> : null}
      <path
        d="M13 2L4 14h7l-1 8 10-14h-7l0-6Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function DocIcon({ size = 20, className, title }: IconProps) {
  return (
    <svg {...baseProps(size, title)} className={className}>
      {title ? <title>{title}</title> : null}
      <path d="M7 3h7l3 3v15H7V3Z" stroke="currentColor" strokeWidth="1.6" />
      <path d="M14 3v4h4" stroke="currentColor" strokeWidth="1.6" />
      <path d="M9 12h6M9 15h6M9 18h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function ChartIcon({ size = 20, className, title }: IconProps) {
  return (
    <svg {...baseProps(size, title)} className={className}>
      {title ? <title>{title}</title> : null}
      <path d="M5 19V5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M5 19h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M8 16v-5M12 16V8M16 16v-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function PuzzleIcon({ size = 20, className, title }: IconProps) {
  return (
    <svg {...baseProps(size, title)} className={className}>
      {title ? <title>{title}</title> : null}
      <path
        d="M9 3h3a2 2 0 1 1 4 0h3v6h-2a2 2 0 1 0 0 4h2v6H3v-6h2a2 2 0 1 0 0-4H3V3h6Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

