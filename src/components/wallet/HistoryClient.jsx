"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import TransactionHistory from "@/components/wallet/TransactionHistory";
import BottomNav from "@/components/layout/BottomNav";

const TABS = [
  { id: "deposit", label: "Deposits" },
  { id: "withdraw", label: "Withdrawals" },
];

export default function HistoryClient({ initialTab = "deposit" }) {
  const [tab, setTab] = useState(initialTab);

  return (
    <div className="relative min-h-dvh bg-linear-to-b from-[#150d26] via-[#0f0a19] to-[#0b0714] text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-violet-600/30 blur-[90px]" />
        <div className="absolute -bottom-32 right-0 h-80 w-80 rounded-full bg-indigo-600/25 blur-[100px]" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-md px-4 pb-28 pt-4">
        <header className="mb-4 flex items-center gap-2">
          <Link
            href="/profile"
            aria-label="Back to profile"
            className="-ml-2 flex h-9 w-9 items-center justify-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-400">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </Link>
          <h1 className="text-lg font-semibold">Wallet history</h1>
        </header>

        <div
          role="tablist"
          className="mb-4 grid grid-cols-2 rounded-xl border border-white/10 bg-[#1a1226] p-1">
          {TABS.map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setTab(t.id)}
                className="relative h-10 rounded-lg text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-400">
                {active && (
                  <motion.span
                    layoutId="wallet-tab"
                    className="absolute inset-0 rounded-lg bg-violet-600"
                    transition={{ type: "spring", stiffness: 500, damping: 40 }}
                  />
                )}
                <span
                  className={`relative ${active ? "text-white" : "text-white/55"}`}>
                  {t.label}
                </span>
              </button>
            );
          })}
        </div>

        <TransactionHistory key={tab} kind={tab} />
      </div>

      <BottomNav />
    </div>
  );
}
