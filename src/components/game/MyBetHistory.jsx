"use client";

import { motion, AnimatePresence } from "motion/react";
import { describeBet } from "@/lib/game/describeBet";

const GRID = "grid grid-cols-[1.3fr_1.5fr_0.9fr_1fr] items-center gap-2";

export default function MyBetHistory({ betHistory }) {
  if (!betHistory || betHistory.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-white/40">
        You haven&apos;t placed any bets yet. Your results will show up here.
      </p>
    );
  }

  return (
    <div className="max-h-80 overflow-y-auto pr-1 [color-scheme:dark] [scrollbar-color:rgba(255,255,255,0.18)_transparent] [scrollbar-width:thin]">
      <div
        className={`${GRID} sticky top-0 z-10 bg-[#1a1226] px-3 pb-2 text-xs text-white/40`}>
        <span>Game</span>
        <span>Bet</span>
        <span className="justify-self-end">Amount</span>
        <span className="justify-self-end">Result</span>
      </div>

      <div className="space-y-1.5">
        <AnimatePresence initial={false}>
          {betHistory.map((b) => (
            <motion.div
              key={b.id}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className={`${GRID} rounded-xl bg-white/[0.03] px-3 py-2.5`}>
              <span className="text-[13px] tabular-nums text-white/45">
                #{b.period}
              </span>
              <span className="truncate text-sm font-medium text-white">
                {describeBet(b)}
              </span>
              <span className="justify-self-end text-sm tabular-nums text-white/60">
                ₹{b.amount}
              </span>
              <span
                className={`justify-self-end text-sm font-semibold tabular-nums ${
                  b.status === "PENDING"
                    ? "text-amber-300"
                    : b.won
                      ? "text-emerald-400"
                      : "text-red-400"
                }`}>
                {b.status === "PENDING"
                  ? "Pending"
                  : b.won
                    ? `+₹${b.payout}`
                    : "Lost"}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
