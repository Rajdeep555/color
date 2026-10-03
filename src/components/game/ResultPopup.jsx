"use client";

import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

/**
 * Shared frame for the round-result popups (win + lose).
 * Purple gradient card, wings, badge, ribbon, lottery result chips and a
 * ticket coming out of a slot. Auto closes after `autoCloseSeconds` (default 5)
 * and the player can close it any time (X button, tap outside, or by
 * tapping the circle to switch auto close off).
 *
 * You normally don't use this directly — use WinCelebrationModal / LoseModal.
 */

const RESULT_CHIP = {
  green: "#22a05a",
  red: "#dc3b43",
  violet: "#9b4fd1",
};

const SIZE_CHIP = {
  big: "#6366f1",
  small: "#38bdf8",
};

const cap = (s = "") => s.charAt(0).toUpperCase() + s.slice(1);

function Wing({ flip = false }) {
  const id = useId();
  return (
    <svg
      viewBox="0 0 90 70"
      className="h-[70px] w-[90px]"
      style={{ transform: flip ? "scaleX(-1)" : undefined }}
      aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="50%" stopColor="#d8b4fe" />
          <stop offset="100%" stopColor="#9333ea" />
        </linearGradient>
      </defs>
      <path
        d="M88 40 C60 8 24 2 2 10 C22 14 40 24 52 40 Z"
        fill={`url(#${id})`}
      />
      <path
        d="M88 44 C62 22 30 20 6 30 C26 32 42 40 54 50 Z"
        fill={`url(#${id})`}
        opacity="0.92"
      />
      <path
        d="M88 48 C66 36 40 38 16 50 C34 50 48 54 58 60 Z"
        fill={`url(#${id})`}
        opacity="0.85"
      />
      <path
        d="M88 52 C70 48 52 52 34 64 C48 62 58 64 64 68 Z"
        fill={`url(#${id})`}
        opacity="0.78"
      />
    </svg>
  );
}

export default function ResultPopup({
  visible,
  onClose,
  icon,
  title,
  label,
  amountText,
  amountClassName = "text-[#4c1d95]",
  colors = [],
  number,
  size,
  gameName = "",
  period = "",
  autoCloseSeconds = 5,
}) {
  const [autoClose, setAutoClose] = useState(true);
  const [secondsLeft, setSecondsLeft] = useState(autoCloseSeconds);

  // always call the latest onClose without restarting the timer
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  // reset each time the popup opens
  useEffect(() => {
    if (visible) {
      setAutoClose(true);
      setSecondsLeft(autoCloseSeconds);
    }
  }, [visible, autoCloseSeconds]);

  // tick
  useEffect(() => {
    if (!visible || !autoClose) return;
    const id = setInterval(
      () => setSecondsLeft((s) => Math.max(0, s - 1)),
      1000,
    );
    return () => clearInterval(id);
  }, [visible, autoClose]);

  // close at 0
  useEffect(() => {
    if (visible && autoClose && secondsLeft <= 0) onCloseRef.current?.();
  }, [visible, autoClose, secondsLeft]);

  const sizeKey = String(size ?? "").toLowerCase();

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b0518]/80 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.6, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 22 }}
            onClick={(e) => e.stopPropagation()}
            className="relative mx-6 w-full max-w-[300px] pt-14">
            {/* wings + badge */}
            <div className="pointer-events-none absolute left-1/2 top-0 z-30 flex -translate-x-1/2 items-end">
              <div className="-mr-3 mb-3">
                <Wing />
              </div>
              <div className="relative z-10 flex h-[68px] w-[68px] items-center justify-center rounded-full border-[3px] border-[#e9d5ff] bg-gradient-to-b from-[#faf5ff] to-[#c084fc] shadow-[0_4px_16px_rgba(88,28,135,0.6)]">
                <div className="flex h-[54px] w-[54px] items-center justify-center rounded-full border border-[#a855f7]/50 bg-gradient-to-b from-[#ffffff] to-[#e9d5ff]">
                  {icon}
                </div>
              </div>
              <div className="-ml-3 mb-3">
                <Wing flip />
              </div>
            </div>

            {/* ribbon behind the card top */}
            <div className="pointer-events-none absolute -left-4 -right-4 top-[46px] z-10 h-12">
              <div
                className="absolute left-0 top-3 h-10 w-10 bg-gradient-to-b from-[#7e22ce] to-[#4c1d95]"
                style={{
                  clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%, 28% 50%)",
                }}
              />
              <div
                className="absolute right-0 top-3 h-10 w-10 bg-gradient-to-b from-[#7e22ce] to-[#4c1d95]"
                style={{
                  clipPath: "polygon(0 0, 100% 0, 72% 50%, 100% 100%, 0 100%)",
                }}
              />
              <div className="absolute inset-x-5 top-0 h-10 rounded-sm bg-gradient-to-b from-[#e879f9] via-[#c026d3] to-[#7e22ce] shadow-[0_3px_8px_rgba(46,16,101,0.55)]" />
            </div>

            {/* purple gradient card */}
            <div className="relative z-20 mt-[6px] overflow-hidden rounded-[22px] border-2 border-[#d8b4fe]/60 bg-gradient-to-b from-[#a78bfa] via-[#7c3aed] to-[#3b0764] px-5 pb-4 pt-12 shadow-[0_10px_45px_rgba(124,58,237,0.45)]">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/30 to-transparent" />

              {/* close */}
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="absolute right-3 top-3 z-30 flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-white">
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3.5"
                  strokeLinecap="round">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>

              <h2 className="relative text-center text-[20px] font-extrabold tracking-tight text-white drop-shadow-[0_2px_6px_rgba(46,16,101,0.6)]">
                {title}
              </h2>

              {/* lottery results */}
              <div className="relative mt-4 flex items-center justify-between gap-2">
                <p className="text-[11px] leading-tight text-white/85">
                  Lottery
                  <br />
                  results
                </p>

                <div className="flex flex-wrap items-center justify-end gap-1.5">
                  {colors.map((c) => (
                    <span
                      key={c}
                      className="rounded px-2.5 py-[3px] text-[11px] font-semibold text-white shadow-sm"
                      style={{ background: RESULT_CHIP[c] ?? "#22a05a" }}>
                      {cap(c)}
                    </span>
                  ))}
                  {number !== undefined && number !== null && (
                    <span className="flex h-6 w-6 items-center justify-center rounded-full border border-white/60 bg-white/90 text-[11px] font-bold text-[#6b21a8]">
                      {number}
                    </span>
                  )}
                  {size && (
                    <span
                      className="rounded px-2.5 py-[3px] text-[11px] font-semibold text-white shadow-sm"
                      style={{ background: SIZE_CHIP[sizeKey] ?? "#6366f1" }}>
                      {cap(String(size))}
                    </span>
                  )}
                </div>
              </div>

              {/* slot + ticket */}
              <div className="relative mt-5">
                <div className="relative z-10 mx-auto h-4 w-full rounded-full bg-gradient-to-b from-[#2e1065] to-[#12041f] shadow-[inset_0_2px_3px_rgba(0,0,0,0.7),0_1px_0_rgba(255,255,255,0.3)]" />

                <motion.div
                  initial={{ y: -40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{
                    delay: 0.25,
                    type: "spring",
                    stiffness: 160,
                    damping: 16,
                  }}
                  className="relative z-0 mx-3 -mt-2 bg-gradient-to-b from-[#fbf7ff] to-[#e9d9ff] px-3 pb-3 pt-5 text-center shadow-[0_4px_8px_rgba(46,16,101,0.35)]"
                  style={{
                    clipPath:
                      "polygon(0 0, 100% 0, 100% 94%, 96% 100%, 92% 94%, 88% 100%, 84% 94%, 80% 100%, 76% 94%, 72% 100%, 68% 94%, 64% 100%, 60% 94%, 56% 100%, 52% 94%, 48% 100%, 44% 94%, 40% 100%, 36% 94%, 32% 100%, 28% 94%, 24% 100%, 20% 94%, 16% 100%, 12% 94%, 8% 100%, 4% 94%, 0 100%)",
                  }}>
                  <p className="text-[13px] font-bold text-[#7e22ce]">
                    {label}
                  </p>
                  <p
                    className={`mt-1 text-[28px] font-extrabold leading-none ${amountClassName}`}>
                    {amountText}
                  </p>
                  {(gameName || period) && (
                    <p className="mt-3 text-[10px] text-[#7e22ce]/80">
                      Period:{gameName} {period}
                    </p>
                  )}
                </motion.div>
              </div>

              {/* auto close */}
              <button
                type="button"
                onClick={() => setAutoClose((v) => !v)}
                className="relative mt-4 flex w-full items-center gap-2 text-left">
                <span className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-white/70 bg-white/10">
                  {autoClose && (
                    <span className="h-2.5 w-2.5 rounded-full bg-white" />
                  )}
                </span>
                <span className="text-[11px] text-white/90">
                  {autoClose
                    ? `${secondsLeft} seconds auto close`
                    : "Auto close off"}
                </span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
