"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { useCountdownBeep } from "@/lib/hooks/useCountdownBeep";

const pad = (n) => String(n).padStart(2, "0");

// Two-colour results (0 and 5) get a split gradient, like the bet panel.
function dotCls(colors = []) {
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

/* One half of a flip tile. The digit is drawn at full tile height (h-9) and
   clipped, so the top half shows the upper part and the bottom the lower. */
function Half({ side, digit, locked, initial, animate, transition, z }) {
  const top = side === "top";
  const tone = top
    ? locked
      ? "text-red-300/70"
      : "text-white/55"
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
      className={`absolute inset-x-0 h-[18px] overflow-hidden ${
        top
          ? "top-0 rounded-t-[4px] bg-gradient-to-b from-[#19191c] to-[#26262a]"
          : "bottom-0 rounded-b-[4px] bg-[#2b2b2f]"
      }`}>
      <span
        className={`absolute inset-x-0 flex h-9 items-center justify-center text-[20px] font-semibold leading-none tabular-nums ${
          top ? "top-0" : "-top-[18px]"
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
    <div className="relative h-9 w-6" style={{ perspective: 200 }}>
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

      <div className="pointer-events-none absolute inset-x-0 top-1/2 z-10 h-px -translate-y-1/2 bg-black/80" />
    </div>
  );
}

function DigitPair({ text, locked }) {
  return (
    <div className="flex gap-0.5 rounded-md border border-black/70 bg-black/60 p-0.5">
      <FlipDigit value={text[0]} locked={locked} />
      <FlipDigit value={text[1]} locked={locked} />
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

  return (
    <section className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#1a1226] px-4 py-3">
      {/* left: game id + recent results */}
      <div className="min-w-0">
        <p className="text-xs text-white/50">
          Game{" "}
          <span className="font-medium tabular-nums text-white/90">
            #{period}
          </span>
        </p>

        <p className="mt-2.5 text-[11px] text-white/40">Recent</p>
        <div className="mt-1 flex flex-wrap gap-1">
          {recent.length === 0 && (
            <span className="text-xs text-white/30">No results yet</span>
          )}
          {recent.map((r) => (
            <span
              key={r.period}
              className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold text-white ${dotCls(
                r.colors,
              )}`}>
              {r.number}
            </span>
          ))}
        </div>
      </div>

      {/* right: compact flip timer + status */}
      <div className="flex shrink-0 flex-col items-center gap-1.5">
        <div
          role="timer"
          aria-label={`${mm} minutes ${ss} seconds left`}
          className="flex items-center gap-1">
          <DigitPair text={mm} locked={isLocked} />
          <div className="flex flex-col gap-1" aria-hidden="true">
            <span className="h-[3px] w-[3px] rounded-full bg-white/40" />
            <span className="h-[3px] w-[3px] rounded-full bg-white/40" />
          </div>
          <DigitPair text={ss} locked={isLocked} />
        </div>

        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium ${
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
    </section>
  );
}
