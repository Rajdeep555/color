"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function BalanceCard({ credits }) {
  const router = useRouter();
  const [hidden, setHidden] = useState(false);

  return (
    <section className="rounded-2xl border border-white/10 bg-[#1a1226] p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-normal text-white/60">Wallet balance</h2>

        <button
          type="button"
          onClick={() => setHidden((h) => !h)}
          aria-label={hidden ? "Show balance" : "Hide balance"}
          className="-mr-1.5 flex h-8 w-8 items-center justify-center rounded-lg text-white/50 transition-colors hover:bg-white/5 hover:text-white/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-400">
          {hidden ? (
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round">
              <path d="M17.94 17.94A10.94 10.94 0 0112 20C5 20 1 12 1 12a19.79 19.79 0 014.61-5.94M9.9 4.24A10.94 10.94 0 0112 4c7 0 11 8 11 8a19.87 19.87 0 01-2.17 3.19" />
              <path d="M14.12 14.12a3 3 0 11-4.24-4.24" />
              <path d="M1 1l22 22" />
            </svg>
          ) : (
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      </div>

      <p className="mt-1 text-[20px] font-normal leading-tight tracking-tight text-white tabular-nums">
        {hidden ? "₹ ••••••" : `₹${Number(credits).toLocaleString("en-IN")}`}
      </p>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => router.push("/deposit")}
          className="flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-500 text-sm font-semibold text-emerald-950 transition active:scale-[0.98] hover:bg-emerald-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.25"
            strokeLinecap="round"
            strokeLinejoin="round">
            <path d="M12 19V5M5 12l7-7 7 7" />
          </svg>
          Deposit
        </button>

        <button
          type="button"
          onClick={() => router.push("/withdraw")}
          className="flex h-11 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] text-sm font-semibold text-white transition active:scale-[0.98] hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.25"
            strokeLinecap="round"
            strokeLinejoin="round">
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
          Withdraw
        </button>
      </div>
    </section>
  );
}
