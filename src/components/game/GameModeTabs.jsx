"use client";

import { motion } from "motion/react";
import { GAME_MODES } from "@/lib/game/clock";

export default function GameModeTabs({ value, onChange }) {
  return (
    <div
      role="tablist"
      aria-label="Round length"
      className="grid grid-cols-4 rounded-xl border border-white/10 bg-[#1a1226] p-1">
      {GAME_MODES.map((mode) => {
        const active = value === mode.seconds;
        return (
          <button
            key={mode.seconds}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(mode.seconds)}
            className="relative h-10 rounded-lg text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-400">
            {active && (
              <motion.span
                layoutId="mode-pill"
                className="absolute inset-0 rounded-lg bg-violet-600"
                transition={{ type: "spring", stiffness: 500, damping: 40 }}
              />
            )}
            <span
              className={`relative transition-colors ${
                active ? "text-white" : "text-white/55"
              }`}>
              {mode.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
