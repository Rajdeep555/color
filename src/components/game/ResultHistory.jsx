"use client";

import { useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";

const DOT = {
  red: "bg-red-500",
  green: "bg-emerald-500",
  violet: "bg-violet-500",
};

// Number colour follows the result's colours; two-colour results get a gradient.
function numberTone(colors = []) {
  const has = (c) => colors.includes(c);
  if (has("violet") && has("red"))
    return "bg-gradient-to-r from-red-400 to-violet-400 bg-clip-text text-transparent";
  if (has("violet") && has("green"))
    return "bg-gradient-to-r from-emerald-400 to-violet-400 bg-clip-text text-transparent";
  if (has("red")) return "text-red-400";
  if (has("green")) return "text-emerald-400";
  if (has("violet")) return "text-violet-400";
  return "text-white";
}

const GRID = "grid grid-cols-[1.5fr_1fr_1fr_1fr] items-center gap-2";

function List({ history }) {
  // Remove duplicate periods (keeps the first copy) so keys are always unique
  const unique = useMemo(() => {
    const seen = new Set();
    return (history ?? []).filter((r) => {
      if (seen.has(r.period)) return false;
      seen.add(r.period);
      return true;
    });
  }, [history]);

  if (unique.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-white/40">
        No rounds yet. Results appear here after each round.
      </p>
    );
  }

  return (
    <div className="max-h-80 overflow-y-auto pr-1 [color-scheme:dark] [scrollbar-color:rgba(255,255,255,0.18)_transparent] [scrollbar-width:thin]">
      <div
        className={`${GRID} sticky top-0 z-10 bg-[#1a1226] px-3 pb-2 text-xs text-white/40`}>
        <span>Game</span>
        <span className="justify-self-center">Number</span>
        <span className="justify-self-center">Size</span>
        <span className="justify-self-end">Color</span>
      </div>

      <div className="space-y-1.5">
        <AnimatePresence initial={false}>
          {unique.map((r) => (
            <motion.div
              key={r.period}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className={`${GRID} rounded-xl bg-white/[0.03] px-3 py-2.5`}>
              <span className="text-[13px] tabular-nums text-white/45">
                #{r.period}
              </span>
              <span
                className={`justify-self-center text-2xl font-bold leading-none tabular-nums ${numberTone(
                  r.colors,
                )}`}>
                {r.number}
              </span>
              <span className="justify-self-center rounded-md bg-white/[0.06] px-2 py-0.5 text-xs font-medium text-white/70">
                {r.isBig ? "Big" : "Small"}
              </span>
              <div className="flex justify-end gap-1.5">
                {(r.colors ?? []).map((c) => (
                  <span
                    key={c}
                    className={`h-3.5 w-3.5 rounded-full ${DOT[c] ?? "bg-slate-600"}`}
                  />
                ))}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

/**
 * bare=true renders just the list (no outer card) — used inside HistoryTabs,
 * which already provides the card and tab switcher.
 */
export default function ResultHistory({ history, bare = false }) {
  if (bare) return <List history={history} />;

  return (
    <section className="rounded-2xl border border-white/10 bg-[#1a1226] p-5">
      <h2 className="mb-3 text-sm font-medium text-white">Recent results</h2>
      <List history={history} />
    </section>
  );
}
