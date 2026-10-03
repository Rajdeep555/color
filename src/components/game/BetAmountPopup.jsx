"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import TermsModal from "@/components/game/TermsModal";

const AMOUNTS = [1, 10, 30, 50, 100, 250, 500, 1000];
const MULTIPLIERS = [3, 5, 10, 25, 50];
const DEFAULT_AMOUNT = 10;
const DEFAULT_MULTIPLIER = 3;
const TERMS_KEY = "terms-accepted-v1"; // remembered on this device

const inr = (n) => `₹${Number(n).toLocaleString("en-IN")}`;
const clock = (s) =>
  `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

const optionCls = (selected) =>
  `h-9 rounded-lg border text-[13px] font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400 ${
    selected
      ? "border-violet-500 bg-violet-600 text-white"
      : "border-white/10 bg-white/[0.04] text-white/70 hover:bg-white/10"
  }`;

export default function BetAmountPopup({
  open,
  betLabel,
  credits,
  isLocked = false,
  timeLeft,
  onConfirm,
  onClose,
}) {
  const [mounted, setMounted] = useState(false);
  const [amount, setAmount] = useState(DEFAULT_AMOUNT);
  const [multiplier, setMultiplier] = useState(DEFAULT_MULTIPLIER);
  const [accepted, setAccepted] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    setAmount(DEFAULT_AMOUNT);
    setMultiplier(DEFAULT_MULTIPLIER);
    setError("");
    try {
      setAccepted(localStorage.getItem(TERMS_KEY) === "1");
    } catch {
      setAccepted(false);
    }
  }, [open]);

  // Escape closes the sheet (the terms dialog handles its own Escape)
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape" && !showTerms) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, showTerms, onClose]);

  const setTerms = (value) => {
    setAccepted(value);
    setError("");
    try {
      if (value) localStorage.setItem(TERMS_KEY, "1");
      else localStorage.removeItem(TERMS_KEY);
    } catch {}
  };

  const total = amount * multiplier;
  const insufficient = total > credits;
  const blocked = isLocked || !accepted || insufficient;

  const handleConfirm = () => {
    if (isLocked) return setError("Betting is closed for this round.");
    if (!accepted)
      return setError("Tick the box to accept the Terms & Conditions.");
    if (insufficient)
      return setError(`Insufficient balance. You need ${inr(total)}.`);
    onConfirm(total);
  };

  if (!mounted) return null;

  return (
    <>
      {/* Rendered in document.body so it sits above the top bar and bottom nav */}
      {createPortal(
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center sm:p-4">
              <motion.div
                role="dialog"
                aria-modal="true"
                aria-label="Place your bet"
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", stiffness: 300, damping: 32 }}
                onClick={(e) => e.stopPropagation()}
                className="max-h-[96dvh] w-full max-w-md overflow-y-auto rounded-t-3xl border border-white/10 bg-[#1a1226] px-4 pt-3 [color-scheme:dark] [scrollbar-color:rgba(255,255,255,0.18)_transparent] [scrollbar-width:thin] sm:rounded-3xl sm:pt-4"
                style={{
                  paddingBottom: "max(1rem, env(safe-area-inset-bottom))",
                }}>
                <div className="mx-auto mb-2.5 h-1 w-10 rounded-full bg-white/20 sm:hidden" />

                {/* header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[11px] text-white/50">You picked</p>
                    <p className="truncate text-lg font-semibold leading-tight text-white">
                      {betLabel}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-1.5">
                    {isLocked ? (
                      <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-[11px] font-medium text-red-300">
                        Betting closed
                      </span>
                    ) : (
                      timeLeft != null && (
                        <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[11px] font-medium tabular-nums text-white/70">
                          {clock(timeLeft)} left
                        </span>
                      )
                    )}
                    <button
                      type="button"
                      onClick={onClose}
                      aria-label="Close"
                      className="-mr-2 flex h-8 w-8 items-center justify-center rounded-lg text-white/60 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-400">
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        aria-hidden="true">
                        <path d="M6 6l12 12M18 6L6 18" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* amount */}
                <h3 className="mb-1.5 mt-3 text-xs font-medium text-white/70">
                  Amount
                </h3>
                <div className="grid grid-cols-4 gap-1.5">
                  {AMOUNTS.map((a) => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => {
                        setAmount(a);
                        setError("");
                      }}
                      className={optionCls(amount === a)}>
                      ₹{a}
                    </button>
                  ))}
                </div>

                {/* multiplier */}
                <h3 className="mb-1.5 mt-3 text-xs font-medium text-white/70">
                  Multiplier
                </h3>
                <div className="grid grid-cols-5 gap-1.5">
                  {MULTIPLIERS.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => {
                        setMultiplier(m);
                        setError("");
                      }}
                      className={optionCls(multiplier === m)}>
                      {m}x
                    </button>
                  ))}
                </div>

                {/* summary */}
                <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[13px] text-white/70">Total bet</p>
                      <p className="text-[11px] tabular-nums text-white/40">
                        {inr(amount)} × {multiplier}
                      </p>
                    </div>
                    <p className="text-lg font-semibold tabular-nums text-white">
                      {inr(total)}
                    </p>
                  </div>
                  <div className="mt-1.5 flex items-center justify-between border-t border-white/10 pt-1.5 text-[11px]">
                    <span className="text-white/45">
                      Balance {inr(credits)}
                    </span>
                    {insufficient && (
                      <Link
                        href="/deposit"
                        className="font-medium text-emerald-300 underline underline-offset-2">
                        Add money
                      </Link>
                    )}
                  </div>
                </div>

                {/* terms */}
                <div className="mt-3 flex items-start gap-2.5">
                  <input
                    id="accept-terms"
                    type="checkbox"
                    checked={accepted}
                    onChange={(e) => setTerms(e.target.checked)}
                    className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-violet-500"
                  />
                  <label
                    htmlFor="accept-terms"
                    className="text-xs leading-snug text-white/65">
                    I am 18 or older and I agree to the{" "}
                    <button
                      type="button"
                      onClick={() => setShowTerms(true)}
                      className="font-medium text-violet-300 underline underline-offset-2 hover:text-violet-200">
                      Terms &amp; Conditions
                    </button>
                    . Bets are final and not refundable.
                  </label>
                </div>

                <p
                  role="alert"
                  className="mt-1.5 min-h-4 text-xs font-medium text-red-300">
                  {error}
                </p>

                {/* actions */}
                <div className="mt-2 grid grid-cols-[2fr_3fr] gap-2.5">
                  <button
                    type="button"
                    onClick={onClose}
                    className="h-11 rounded-xl border border-white/15 bg-white/[0.04] text-sm font-semibold text-white transition active:scale-[0.98] hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400">
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirm}
                    aria-disabled={blocked}
                    className={`h-11 rounded-xl bg-violet-600 text-sm font-semibold text-white transition active:scale-[0.98] hover:bg-violet-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300 ${
                      blocked ? "opacity-50" : ""
                    }`}>
                    Confirm {inr(total)}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}

      <TermsModal
        open={showTerms}
        onClose={() => setShowTerms(false)}
        onAccept={() => setTerms(true)}
      />
    </>
  );
}
