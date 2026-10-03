"use client";

import ResultPopup from "./ResultPopup";

function SadIcon() {
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
      <circle cx="12" cy="12" r="10" />
      <path d="M16 16s-1.5-2-4-2-4 2-4 2" />
      <path d="M9 9h.01M15 9h.01" />
    </svg>
  );
}

/**
 * Shown when the user bet in the round that just resolved and lost.
 * Home page decides WHEN to show this, this component just renders it.
 *
 * Props:
 *  - visible, onClose
 *  - lossAmount number          total amount lost this round
 *  - colors     string[]        winning colors, e.g. ["green", "violet"]
 *  - number     number          winning number
 *  - size       "big" | "small" winning size
 *  - gameName   string          e.g. "30 Sec"
 *  - period     string|number   game / period id
 *  - autoCloseSeconds           default 5
 */
export default function LoseModal({
  visible,
  onClose,
  lossAmount,
  colors,
  number,
  size,
  gameName,
  period,
  autoCloseSeconds = 5,
}) {
  const formatted = Number(lossAmount ?? 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <ResultPopup
      visible={visible}
      onClose={onClose}
      icon={<SadIcon />}
      title="Better luck next time"
      label="Loss"
      amountText={`-₹${formatted}`}
      amountClassName="text-[#be123c]"
      colors={colors}
      number={number}
      size={size}
      gameName={gameName}
      period={period}
      autoCloseSeconds={autoCloseSeconds}
    />
  );
}
