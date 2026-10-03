"use client";

import SettingsMenu from "@/components/layout/SettingsMenu";

/* A flowing line that rises toward the logo. The right one is the same SVG
   mirrored, so the gradient always fades out at the outer end. */
function Curve({ id, flip = false }) {
  return (
    <svg
      viewBox="0 0 100 28"
      preserveAspectRatio="none"
      aria-hidden="true"
      className={`h-7 min-w-0 flex-1 ${flip ? "-scale-x-100" : ""}`}>
      <defs>
        <linearGradient id={id} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#a855f7" stopOpacity="0" />
          <stop offset="1" stopColor="#c084fc" stopOpacity="0.95" />
        </linearGradient>
      </defs>
      <path
        d="M0 25 C 28 25 42 6 70 7 S 92 14 100 14"
        fill="none"
        stroke={`url(#${id})`}
        strokeWidth="1.5"
        vectorEffect="non-scaling-stroke"
      />
      <path
        d="M0 19 C 26 19 44 2 72 3 S 92 14 100 14"
        fill="none"
        stroke={`url(#${id})`}
        strokeOpacity="0.45"
        strokeWidth="1"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

export default function TopBar({ credits }) {
  return (
    <header className="sticky top-0 z-30 -mx-4 mb-4 border-b border-white/5 bg-[#0f0a19]/90 px-4 py-2.5 backdrop-blur">
      <div className="flex items-center gap-2">
        {/* spacer mirrors the settings button so the logo stays centred */}
        <div className="w-9 shrink-0" />
        <Curve id="curve-left" />

        <h1 className="shrink-0 px-1 text-xl font-medium  tracking-tight">
          <span className="bg-gradient-to-r from-fuchsia-400 to-violet-400 bg-clip-text text-transparent">
            91
          </span>{" "}
          <span className="text-white italic font-semibold">League</span>
        </h1>

        <Curve id="curve-right" flip />
        <SettingsMenu />
      </div>
    </header>
  );
}
