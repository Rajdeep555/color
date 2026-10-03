"use client";

import { useId } from "react";
import { motion } from "motion/react";
import { resolveColors } from "@/store/gameStore";

// light = highlight, base = body, dark = rim shadow
const PALETTE = {
  red: { light: "#f26a70", base: "#dc3b43", dark: "#a3202a" },
  green: { light: "#4cc982", base: "#22a05a", dark: "#12703c" },
  violet: { light: "#bf7df0", base: "#9b4fd1", dark: "#6a2b9c" },
};

const NOTCH_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];

export default function NumberChip({ number, disabled, booked, onClick }) {
  const uid = useId();
  const colors = resolveColors(number);
  const isSplit = colors.length > 1;
  const primary = PALETTE[colors[0]];
  const secondary = isSplit ? PALETTE[colors[1]] : primary;

  return (
    <motion.button
      type="button"
      disabled={disabled}
      onClick={onClick}
      whileTap={disabled ? undefined : { scale: 0.88 }}
      className={`relative mx-auto block h-11 w-11 shrink-0 ${disabled ? "opacity-30" : ""}`}>
      <svg
        viewBox="0 0 100 100"
        className="h-full w-full drop-shadow-[0_2px_3px_rgba(0,0,0,0.5)]">
        <defs>
          <radialGradient id={`${uid}-p`} cx="35%" cy="28%" r="85%">
            <stop offset="0%" stopColor={primary.light} />
            <stop offset="60%" stopColor={primary.base} />
            <stop offset="100%" stopColor={primary.dark} />
          </radialGradient>
          <radialGradient id={`${uid}-s`} cx="35%" cy="28%" r="85%">
            <stop offset="0%" stopColor={secondary.light} />
            <stop offset="60%" stopColor={secondary.base} />
            <stop offset="100%" stopColor={secondary.dark} />
          </radialGradient>
        </defs>

        {/* chip body */}
        {isSplit ? (
          <>
            <path d="M50,4 A46,46 0 0,1 50,96 Z" fill={`url(#${uid}-p)`} />
            <path d="M50,4 A46,46 0 0,0 50,96 Z" fill={`url(#${uid}-s)`} />
          </>
        ) : (
          <circle cx="50" cy="50" r="46" fill={`url(#${uid}-p)`} />
        )}
        <circle
          cx="50"
          cy="50"
          r="46"
          fill="none"
          stroke="rgba(0,0,0,0.25)"
          strokeWidth="1.5"
        />

        {/* rim notches */}
        {NOTCH_ANGLES.map((angle) => (
          <rect
            key={angle}
            x="44"
            y="4"
            width="12"
            height="11"
            rx="2"
            fill="white"
            opacity="0.92"
            transform={`rotate(${angle} 50 50)`}
          />
        ))}

        {/* inner ring */}
        <circle
          cx="50"
          cy="50"
          r="35"
          fill="none"
          stroke="white"
          strokeOpacity="0.55"
          strokeWidth="2"
        />

        {/* translucent grey centre */}
        <circle
          cx="50"
          cy="50"
          r="30"
          fill="#9ca3af"
          fillOpacity="0.72"
          stroke="white"
          strokeOpacity="0.45"
          strokeWidth="1.5"
        />

        {/* gloss */}
        <ellipse
          cx="38"
          cy="26"
          rx="22"
          ry="9"
          fill="white"
          opacity="0.2"
          transform="rotate(-25 38 26)"
        />

        <text
          x="50"
          y="52"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="30"
          fontWeight="800"
          fill="#4b5563"
          stroke="rgba(255,255,255,0.3)"
          strokeWidth="1"
          paintOrder="stroke">
          {number}
        </text>
      </svg>

      {/* booked indicator — distinct from just "round locked" */}
      {booked && (
        <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-[#0b0518]">
          <svg
            width="8"
            height="8"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="4">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </span>
      )}
    </motion.button>
  );
}
