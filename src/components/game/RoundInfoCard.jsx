"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { useCountdownBeep } from "@/lib/hooks/useCountdownBeep";

const pad = (n) => String(n).padStart(2, "0");

// Width of the right-hand (timer) section. The ticket notches are cut at this
// distance from the right edge, so keep the two in sync.
const RIGHT_W = 152;
const NOTCH_R = 9;

// Two-colour results (0 and 5) get a split gradient, like the bet panel.
function ballCls(colors = []) {
  const has = (c) => colors.includes(c);
  if (has("violet") && has("red"))
    return "bg-gradient-to-br from-red-500 to-violet-500";
  if (has("violet") && has("green"))
    return "bg-gradient-to-br from-emerald-500 to-violet-500";
  if (has("red")) return "bg-red-500";
  if (has("green")) return "bg-emerald-500";
  if (has("violet")) return "bg-violet-500";
  return "bg-slate-600";
}

function formatTitle(roundDuration) {
  const s = Number(roundDuration);
  if (!s) return "WinGo";
  return s < 60 ? `WinGo ${s}sec` : `WinGo ${Math.round(s / 60)}min`;
}

/* One half of a flip tile. The digit is drawn at full tile height (h-10) and
   clipped, so the top half shows the upper part and the bottom the lower. */
function Half({ side, digit, locked, initial, animate, transition, z }) {
  const top = side === "top";
  const tone = top
    ? locked
      ? "text-red-300/70"
      : "text-white/60"
    : locked
      ? "text-red-400"
      : "text-white";

  return (
    <motion.div
      initial={initial}
      animate={animate}
      transition={transition}
      style={{
        backfaceVisibility: "hidden",
        transformOrigin: top ? "50% 100%" : "50% 0%",
        zIndex: z,
      }}
      className={`absolute inset-x-0 h-5 overflow-hidden ${
        top
          ? "top-0 rounded-t-[5px] bg-gradient-to-b from-[#141417] to-[#222226]"
          : "bottom-0 rounded-b-[5px] bg-[#2b2b2f]"
      }`}>
      <span
        className={`absolute inset-x-0 flex h-10 items-center justify-center text-[24px] font-bold leading-none tabular-nums ${
          top ? "top-0" : "-top-5"
        } ${tone}`}>
        {digit}
      </span>
    </motion.div>
  );
}

function FlipDigit({ value, locked }) {
  const reduce = useReducedMotion();
  const [s, setS] = useState({ prev: value, curr: value, n: 0 });

  useEffect(() => {
    setS((p) =>
      p.curr === value ? p : { prev: p.curr, curr: value, n: p.n + 1 },
    );
  }, [value]);

  const flipping = !reduce && s.n > 0;

  return (
    <div
      className="relative h-10 w-7 rounded-[5px] border border-black/70 bg-black shadow-[0_2px_6px_rgba(0,0,0,0.5)]"
      style={{ perspective: 240 }}>
      <Half side="top" digit={s.curr} locked={locked} />
      <Half side="bottom" digit={flipping ? s.prev : s.curr} locked={locked} />

      {flipping && (
        <>
          <Half
            key={`t${s.n}`}
            side="top"
            digit={s.prev}
            locked={locked}
            z={2}
            initial={{ rotateX: 0 }}
            animate={{ rotateX: -90 }}
            transition={{ duration: 0.2, ease: "easeIn" }}
          />
          <Half
            key={`b${s.n}`}
            side="bottom"
            digit={s.curr}
            locked={locked}
            z={2}
            initial={{ rotateX: 90 }}
            animate={{ rotateX: 0 }}
            transition={{ duration: 0.2, delay: 0.2, ease: "easeOut" }}
          />
        </>
      )}

      {/* centre hinge line */}
      <div className="pointer-events-none absolute inset-x-0 top-1/2 z-10 h-px -translate-y-1/2 bg-black/80" />
    </div>
  );
}

export default function RoundInfoCard({
  history,
  timeLeft,
  roundDuration,
  isLocked,
  period,
}) {
  useCountdownBeep(timeLeft, isLocked);

  const safe = Math.max(0, Math.floor(timeLeft ?? 0));
  const mm = pad(Math.floor(safe / 60));
  const ss = pad(safe % 60);

  const recent = useMemo(() => {
    const seen = new Set();
    const out = [];
    for (const r of history ?? []) {
      if (seen.has(r.period)) continue;
      seen.add(r.period);
      out.push(r);
      if (out.length === 5) break;
    }
    return out;
  }, [history]);

  // Ticket cut-outs: a half-circle bitten out of the top and bottom edge at
  // the divider. Masking (instead of painted circles) keeps them transparent
  // whatever the page background is.
  const notch = `radial-gradient(circle ${NOTCH_R}px at calc(100% - ${RIGHT_W}px) 0, transparent ${NOTCH_R - 0.5}px, #000 ${NOTCH_R}px), radial-gradient(circle ${NOTCH_R}px at calc(100% - ${RIGHT_W}px) 100%, transparent ${NOTCH_R - 0.5}px, #000 ${NOTCH_R}px)`;

  return (
    <section
      className="relative flex overflow-hidden rounded-2xl bg-gradient-to-br from-[#241838] via-[#1a1226] to-[#150e20] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]"
      style={{
        WebkitMaskImage: notch,
        maskImage: notch,
        WebkitMaskComposite: "source-in",
        maskComposite: "intersect",
      }}>
      {/* left: title, recent results, status */}
      <div className="flex min-w-0 flex-1 flex-col justify-between gap-3 py-3.5 pl-4 pr-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-violet-300">
            {formatTitle(roundDuration)}
          </span>
        </div>

        <div>
          <p className="mb-1.5 text-[11px] text-white/40">Recent</p>
          <div className="flex flex-wrap gap-1.5">
            {recent.length === 0 && (
              <span className="text-xs text-white/30">No results yet</span>
            )}
            {recent.map((r) => (
              <span
                key={r.period}
                className={`relative flex h-7 w-7 items-center justify-center overflow-hidden rounded-full text-[12px] font-bold text-white shadow-[0_2px_4px_rgba(0,0,0,0.45),inset_0_-3px_5px_rgba(0,0,0,0.25)] ${ballCls(
                  r.colors,
                )}`}>
                {/* glossy highlight */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_22%,rgba(255,255,255,0.65),transparent_52%)]"
                />
                <span className="relative drop-shadow-[0_1px_1px_rgba(0,0,0,0.35)]">
                  {r.number}
                </span>
              </span>
            ))}
          </div>
        </div>

        <span
          className={`inline-flex w-fit items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium ${
            isLocked
              ? "bg-red-500/15 text-red-300"
              : "bg-emerald-500/15 text-emerald-300"
          }`}>
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              isLocked ? "bg-red-400" : "bg-emerald-400"
            }`}
          />
          {isLocked ? "Betting closed" : "Betting open"}
        </span>
      </div>

      {/* ticket divider */}
      <div
        aria-hidden="true"
        className="my-3 w-px shrink-0 self-stretch border-l border-dashed border-white/20"
      />

      {/* right: time remaining, flip timer, game id */}
      <div
        className="flex shrink-0 flex-col items-center justify-between gap-2 px-2 py-3.5"
        style={{ width: RIGHT_W - 1 }}>
        <p className="text-[12px] font-semibold text-violet-300">
          Time remaining
        </p>

        <div
          role="timer"
          aria-label={`${mm} minutes ${ss} seconds left`}
          className="flex items-center gap-[3px]">
          <FlipDigit value={mm[0]} locked={isLocked} />
          <FlipDigit value={mm[1]} locked={isLocked} />
          <div className="flex flex-col gap-1.5 px-[1px]" aria-hidden="true">
            <span className="h-1 w-1 rounded-full bg-white/60" />
            <span className="h-1 w-1 rounded-full bg-white/60" />
          </div>
          <FlipDigit value={ss[0]} locked={isLocked} />
          <FlipDigit value={ss[1]} locked={isLocked} />
        </div>

        <p className="text-[12px] font-bold tabular-nums tracking-wide text-violet-200">
          {period}
        </p>
      </div>
    </section>
  );
}
