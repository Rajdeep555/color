"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/layout/BottomNav";

const SUPPORT_EMAIL = "kleininstenta@gmail.com"; // TODO: replace with your real support inbox

const svg = (children) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true">
    {children}
  </svg>
);

function MenuRow({ icon, label, hint, onClick, danger = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 border-b border-white/5 px-4 py-3.5 text-left transition-colors last:border-b-0 hover:bg-white/[0.03] focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-violet-400">
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
          danger
            ? "bg-red-500/15 text-red-400"
            : "bg-white/[0.06] text-white/70"
        }`}>
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span
          className={`block text-sm font-medium ${danger ? "text-red-400" : "text-white"}`}>
          {label}
        </span>
        {hint && <span className="block text-xs text-white/40">{hint}</span>}
      </span>
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="text-white/30"
        aria-hidden="true">
        <path d="M9 18l6-6-6-6" />
      </svg>
    </button>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [hidden, setHidden] = useState(false);

  // balance and stats come from the database
  useEffect(() => {
    let alive = true;
    fetch("/api/game/bets?limit=1", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => alive && d && setData(d))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const credits = data?.balance ?? 0;
  const totalBets = data?.summary.count ?? 0;
  const totalWins = data?.summary.wins ?? 0;
  const totalWon = data?.summary.totalWon ?? 0;

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.push("/login");
    }
  };

  const stats = [
    { label: "Bets", value: totalBets, tone: "text-white" },
    { label: "Wins", value: totalWins, tone: "text-emerald-400" },
    {
      label: "Won",
      value: `₹${totalWon.toLocaleString("en-IN")}`,
      tone: "text-white",
    },
  ];

  return (
    <div className="relative min-h-dvh bg-gradient-to-b from-[#150d26] via-[#0f0a19] to-[#0b0714] text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-violet-600/30 blur-[90px]" />
        <div className="absolute -bottom-32 right-0 h-80 w-80 rounded-full bg-indigo-600/25 blur-[100px]" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-md space-y-3 px-4 pb-28 pt-6">
        {/* header */}
        <div className="mb-2 flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-violet-600 text-xl font-semibold text-white">
            P
          </div>
          <div>
            <p className="text-lg font-semibold">Player</p>
            <p className="text-xs text-white/45">91 League member</p>
          </div>
        </div>

        {/* balance */}
        <section className="rounded-2xl border border-white/10 bg-[#1a1226] p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-white/60">
              Wallet balance
            </h2>
            <button
              type="button"
              onClick={() => setHidden((h) => !h)}
              aria-label={hidden ? "Show balance" : "Hide balance"}
              className="-mr-1.5 flex h-8 w-8 items-center justify-center rounded-lg text-white/50 hover:bg-white/5 hover:text-white/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-400">
              {hidden
                ? svg(
                    <>
                      <path d="M17.94 17.94A10.94 10.94 0 0112 20C5 20 1 12 1 12a19.79 19.79 0 014.61-5.94M9.9 4.24A10.94 10.94 0 0112 4c7 0 11 8 11 8a19.87 19.87 0 01-2.17 3.19" />
                      <path d="M1 1l22 22" />
                    </>,
                  )
                : svg(
                    <>
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </>,
                  )}
            </button>
          </div>
          <p className="mt-1 text-[28px] font-semibold leading-tight tabular-nums">
            {hidden
              ? "₹ ••••••"
              : `₹${Number(credits).toLocaleString("en-IN")}`}
          </p>
        </section>

        {/* stats */}
        <div className="grid grid-cols-3 gap-2">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-xl border border-white/10 bg-[#1a1226] px-3 py-3 text-center">
              <p className={`text-lg font-semibold tabular-nums ${s.tone}`}>
                {s.value}
              </p>
              <p className="mt-0.5 text-xs text-white/45">{s.label}</p>
            </div>
          ))}
        </div>

        {/* menu */}
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#1a1226]">
          <MenuRow
            label="Bank details"
            hint="Where your withdrawals are paid"
            onClick={() => router.push("/withdraw")}
            icon={svg(
              <>
                <rect x="2" y="6" width="20" height="14" rx="2" />
                <path d="M2 10h20" />
              </>,
            )}
          />
          <MenuRow
            label="Deposit history"
            hint="All money you added"
            onClick={() => router.push("/history?tab=deposit")}
            icon={svg(<path d="M12 19V5M5 12l7-7 7 7" />)}
          />
          <MenuRow
            label="Withdrawal history"
            hint="Status of every withdrawal"
            onClick={() => router.push("/history?tab=withdraw")}
            icon={svg(<path d="M12 5v14M5 12l7 7 7-7" />)}
          />
          <MenuRow
            label="Support"
            hint={SUPPORT_EMAIL}
            onClick={() => {
              window.location.href = `mailto:${SUPPORT_EMAIL}`;
            }}
            icon={svg(
              <>
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="M22 6l-10 7L2 6" />
              </>,
            )}
          />
          <MenuRow
            label="Logout"
            onClick={handleLogout}
            danger
            icon={svg(
              <>
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                <path d="M16 17l5-5-5-5" />
                <path d="M21 12H9" />
              </>,
            )}
          />
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
