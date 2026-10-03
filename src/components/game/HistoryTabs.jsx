"use client";

import { useState } from "react";
import { motion } from "motion/react";
import ResultHistory from "@/components/game/ResultHistory";
import MyBetHistory from "@/components/game/MyBetHistory";

const TABS = [
  { id: "recent", label: "Results" },
  { id: "mine", label: "My bets" },
];

export default function HistoryTabs({ history, betHistory }) {
  const [active, setActive] = useState("recent");

  return (
    <section className="rounded-2xl border border-white/10 bg-[#1a1226] p-4">
      <div
        role="tablist"
        className="mb-3 grid grid-cols-2 rounded-xl bg-black/30 p-1">
        {TABS.map((tab) => {
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActive(tab.id)}
              className="relative h-9 rounded-lg text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-400">
              {isActive && (
                <motion.span
                  layoutId="history-tab"
                  className="absolute inset-0 rounded-lg bg-white/10"
                  transition={{ type: "spring", stiffness: 500, damping: 40 }}
                />
              )}
              <span
                className={`relative transition-colors ${
                  isActive ? "text-white" : "text-white/50"
                }`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>

      {active === "recent" ? (
        <ResultHistory history={history} bare />
      ) : (
        <MyBetHistory betHistory={betHistory} />
      )}
    </section>
  );
}
