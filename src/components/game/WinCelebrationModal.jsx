"use client";

import ResultPopup from "./ResultPopup";

function RocketIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-8 w-8"
      fill="none"
      stroke="#7e22ce"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true">
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </svg>
  );
}

/**
 * Shown when the user's bets from the round that just resolved won something.
 * Home page decides WHEN to show this (watching lastResult),
 * this component just renders the popup itself.
 *
 * Props:
 *  - visible, onClose
 *  - amount     number          total won
 *  - colors     string[]        winning colors, e.g. ["green", "violet"]
 *  - number     number          winning number
 *  - size       "big" | "small" winning size
 *  - gameName   string          e.g. "30 Sec"
 *  - period     string|number   game / period id
 *  - autoCloseSeconds           default 5
 */
export default function WinCelebrationModal({
  visible,
  amount,
  onClose,
  colors,
  number,
  size,
  gameName,
  period,
  autoCloseSeconds = 5,
}) {
  const formatted = Number(amount ?? 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <ResultPopup
      visible={visible}
      onClose={onClose}
      icon={<RocketIcon />}
      title="Congratulations"
      label="Bonus"
      amountText={`₹${formatted}`}
      amountClassName="text-[#4c1d95]"
      colors={colors}
      number={number}
      size={size}
      gameName={gameName}
      period={period}
      autoCloseSeconds={autoCloseSeconds}
    />
  );
}
