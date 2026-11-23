import type { SVGProps } from "react";

export interface LogoIconProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

export function StudioLogoIcon({ className, size = 18, ...props }: LogoIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <circle cx="5" cy="5" r="2.5" className="fill-emerald-400" />
      <circle cx="19" cy="5" r="2.5" className="fill-zinc-400" />
      <circle cx="19" cy="19" r="2.5" className="fill-emerald-400" />
      <circle cx="5" cy="19" r="2.5" className="fill-zinc-400" />

      {/* Dây nối DAG Topological */}
      <path
        d="M5 7.5V16.5M7.5 5H16.5M7 7L17 17M16.5 19H7.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeDasharray="2 2"
        className="text-zinc-600"
      />
      <circle cx="12" cy="12" r="1.5" className="fill-emerald-400" />
    </svg>
  );
}
