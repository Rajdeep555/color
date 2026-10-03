"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import NumberChip from "@/components/game/NumberChip";
import BetAmountPopup from "@/components/game/BetAmountPopup";
import { describeBet } from "@/lib/game/describeBet";

const COLORS = [
  {
    value: "green",
    label: "Green",
    bg: "from-emerald-400 to-emerald-600",
    ring: "shadow-[0_0_14px_rgba(16,185,129,0.45)]",
  },
  {
    value: "violet",
    label: "Violet",
    bg: "from-violet-400 to-fuchsia-600",
    ring: "shadow-[0_0_14px_rgba(168,85,247,0.45)]",
  },
  {
    value: "red",
    label: "Red",
    bg: "from-rose-400 to-red-600",
    ring: "shadow-[0_0_14px_rgba(239,68,68,0.45)]",
  },
];

function SectionLabel({ children, hint }) {
  return (
    <div className="mb-2 flex items-baseline justify-between">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {children}
      </p>
      {hint && <p className="text-[11px] text-slate-500">{hint}</p>}
    </div>
  );
}

export default function BetPanel({
  credits,
  isLocked,
  currentBets,
  onPlaceBet, // async: returns { ok, reason? }
}) {
  const [pendingBet, setPendingBet] = useState(null); // { type, value, label } | null
  const [toast, setToast] = useState(null);

  const isBooked = (type, value) =>
    currentBets.some((b) => b.type === type && b.value === value);

  const openPopup = (type, value, label) => {
    if (isLocked || isBooked(type, value)) return;
    setPendingBet({ type, value, label });
  };

  const handleConfirm = async (totalAmount) => {
    const bet = pendingBet;
    if (!bet) return;

    // close the popup right away so a double tap can't send the bet twice
    setPendingBet(null);

    const result = await onPlaceBet({
      type: bet.type,
      value: bet.value,
      amount: totalAmount,
    });

    setToast({
      ok: result.ok,
      text: result.ok
        ? `Booked — ₹${totalAmount} on ${describeBet(bet)}`
        : result.reason,
    });
    setTimeout(() => setToast(null), 1600);
  };

  return (
    <div className="relative space-y-4 rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-5">
      {/* color bets */}
      <div>
        <SectionLabel hint="2x / 2x / 4.5x">Pick a color</SectionLabel>
        <div className="grid grid-cols-3 gap-2">
          {COLORS.map((c) => {
            const booked = isBooked("color", c.value);
            return (
              <motion.button
                key={c.value}
                disabled={isLocked || booked}
                onClick={() => openPopup("color", c.value, c.label)}
                whileTap={isLocked || booked ? undefined : { scale: 0.94 }}
                className={`relative rounded-lg bg-gradient-to-br py-2 text-xs font-bold uppercase text-white disabled:opacity-30 ${c.bg} ${c.ring}`}>
                {c.label}
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
          })}
        </div>
      </div>

      {/* number chips */}
      <div>
        <SectionLabel hint="9x">Pick a number</SectionLabel>
        <div className="grid grid-cols-5 gap-2.5">
          {Array.from({ length: 10 }, (_, n) => n).map((n) => {
            const booked = isBooked("number", n);
            return (
              <NumberChip
                key={n}
                number={n}
                disabled={isLocked || booked}
                booked={booked}
                onClick={() => openPopup("number", n, `Number ${n}`)}
              />
            );
          })}
        </div>
      </div>

      {/* big / small */}
      <div>
        <SectionLabel hint="2x">Big or small</SectionLabel>
        <div className="grid grid-cols-2 gap-3">
          {[
            {
              value: "big",
              label: "Big",
              sub: "",
              bg: "from-indigo-400 to-indigo-600",
              shadow: "shadow-[0_0_20px_rgba(99,102,241,0.4)]",
            },
            {
              value: "small",
              label: "Small",
              sub: "",
              bg: "from-sky-400 to-sky-600",
              shadow: "shadow-[0_0_20px_rgba(56,189,248,0.4)]",
            },
          ].map((opt) => {
            const booked = isBooked("bigsmall", opt.value);
            return (
              <motion.button
                key={opt.value}
                disabled={isLocked || booked}
                onClick={() => openPopup("bigsmall", opt.value, opt.label)}
                whileTap={isLocked || booked ? undefined : { scale: 0.96 }}
                className={`relative rounded-xl bg-gradient-to-br py-3 text-sm font-bold uppercase text-white disabled:opacity-30 ${opt.bg} ${opt.shadow}`}>
                {opt.label}{" "}
                <span className="font-normal opacity-80">{opt.sub}</span>
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
          })}
        </div>
      </div>

      {/* floating toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 12, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 12, x: "-50%" }}
            className={[
              "fixed bottom-24 left-1/2 z-40 rounded-full px-4 py-2 text-xs font-semibold shadow-lg",
              toast.ok
                ? "bg-emerald-500/90 text-white shadow-emerald-500/30"
                : "bg-red-500/90 text-white shadow-red-500/30",
            ].join(" ")}>
            {toast.text}
          </motion.div>
        )}
      </AnimatePresence>

      <BetAmountPopup
        open={!!pendingBet}
        betLabel={pendingBet?.label}
        credits={credits}
        onConfirm={handleConfirm}
        onClose={() => setPendingBet(null)}
      />
    </div>
  );
}
