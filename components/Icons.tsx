import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement> & { size?: number };

const base = ({ size = 22, ...p }: P) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  ...p,
});

export const HomeIcon = (p: P) => (
  <svg {...base(p)}><path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" /></svg>
);
export const TrendIcon = (p: P) => (
  <svg {...base(p)}><path d="M3 17l6-6 4 4 8-8M15 7h6v6" /></svg>
);
export const SearchIcon = (p: P) => (
  <svg {...base(p)}><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>
);
export const LibIcon = (p: P) => (
  <svg {...base(p)}><path d="M4 4v16M9 4v16M14 4l6 16" /></svg>
);
export const PlayIcon = ({ size = 22, ...p }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden {...p}><path d="M7 4l13 8-13 8z" /></svg>
);
export const PauseIcon = ({ size = 22, ...p }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden {...p}>
    <rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" />
  </svg>
);
// Media controls stay left-to-right even in an RTL layout (like a tape deck).
export const NextIcon = (p: P) => (
  <svg {...base(p)}><path d="M5 4l10 8-10 8zM19 5v14" /></svg>
);
export const PrevIcon = (p: P) => (
  <svg {...base(p)}><path d="M19 20L9 12l10-8zM5 19V5" /></svg>
);
export const RepeatIcon = (p: P) => (
  <svg {...base(p)}><path d="M17 2l4 4-4 4M3 11V9a3 3 0 0 1 3-3h15M7 22l-4-4 4-4M21 13v2a3 3 0 0 1-3 3H3" /></svg>
);
export const ShuffleIcon = (p: P) => (
  <svg {...base(p)}><path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5" /></svg>
);
export const HeartIcon = ({ filled, ...p }: P & { filled?: boolean }) => (
  <svg {...base(p)} fill={filled ? "currentColor" : "none"}>
    <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />
  </svg>
);
export const ChevronDown = (p: P) => (
  <svg {...base(p)}><path d="M6 9l6 6 6-6" /></svg>
);
export const MoreIcon = (p: P) => (
  <svg {...base(p)}><circle cx="5" cy="12" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /></svg>
);
export const SoundIcon = ({ off, ...p }: P & { off?: boolean }) => (
  <svg {...base(p)}>
    <path d="M11 5L6 9H3v6h3l5 4z" />
    {off ? <path d="M22 9l-6 6M16 9l6 6" /> : <path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" />}
  </svg>
);
export const DownloadIcon = (p: P) => (
  <svg {...base(p)}><path d="M12 4v12M6 11l6 6 6-6M4 21h16" /></svg>
);
export const Logo = ({ size = 22 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
    <path d="M9 18V6l11-2v12" stroke="#fff" strokeWidth="2" fill="none" />
    <circle cx="6.5" cy="18" r="3" fill="#fff" />
    <circle cx="17.5" cy="16" r="3" fill="#fff" />
  </svg>
);
