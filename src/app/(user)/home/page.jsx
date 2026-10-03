"use client";

import { useEffect, useRef, useState } from "react";
import { useServerGame } from "@/lib/hooks/useServerGame";
import { resolveColors } from "@/store/gameStore";
import TopBar from "@/components/layout/TopBar";
import BalanceCard from "@/components/game/BalanceCard";
import GameModeTabs from "@/components/game/GameModeTabs";
import RoundInfoCard from "@/components/game/RoundInfoCard";
import BetPanel from "@/components/game/BetPanel";
import HistoryTabs from "@/components/game/HistoryTabs";
import WinCelebrationModal from "@/components/game/WinCelebrationModal";
import LoseModal from "@/components/game/LoseModal";
import BottomNav from "@/components/layout/BottomNav";

// "30s" / 30 / 60 / 300 ... -> "30 Sec" / "1 Min" / "5 Min"
function formatDuration(d) {
  if (typeof d === "number") {
    return d < 60 ? `${d} Sec` : `${Math.round(d / 60)} Min`;
  }
  return String(d ?? "");
}

export default function HomePage() {
  // clock, Game ID, results, balance and bets all come from the server
  const {
    duration,
    setDuration,
    credits,
    period,
    timeLeft,
    isLocked,
    history,
    currentBets,
    betHistory,
    lastResult,
    placeBet,
  } = useServerGame();

  // popup data stays set after closing so the exit animation keeps its content
  const [popup, setPopup] = useState(null); // { type, amount, number, colors, size, period }
  const [popupOpen, setPopupOpen] = useState(false);

  const shownPeriodRef = useRef(null);
  const betTotalRef = useRef(0); // total the player bet in the current round

  // remember how much the player has bet, so the loss popup can show it
  useEffect(() => {
    const total = (currentBets ?? []).reduce(
      (sum, b) => sum + (Number(b.amount) || 0),
      0,
    );
    if (total > 0) betTotalRef.current = total;
  }, [currentBets]);

  // open the win / lose popup once per finished round
  useEffect(() => {
    if (!lastResult || shownPeriodRef.current === lastResult.period) return;
    shownPeriodRef.current = lastResult.period;

    const won = lastResult.winAmount > 0;
    if (!won && !lastResult.hadBets) return; // player didn't bet: no popup

    const number = lastResult.number;
    const hasNumber = number !== undefined && number !== null;

    setPopup({
      type: won ? "win" : "lose",
      amount: won
        ? lastResult.winAmount
        : (lastResult.lossAmount ?? lastResult.totalBet ?? betTotalRef.current),
      number,
      colors: lastResult.colors ?? (hasNumber ? resolveColors(number) : []),
      size:
        lastResult.size ??
        (hasNumber ? (number >= 5 ? "big" : "small") : undefined),
      period: lastResult.period,
    });
    setPopupOpen(true);
    betTotalRef.current = 0;
  }, [lastResult]);

  const closePopup = () => setPopupOpen(false);
  const gameName = formatDuration(duration);

  return (
    <div className="relative min-h-dvh bg-gradient-to-b from-[#150d26] via-[#0f0a19] to-[#0b0714] text-white">
      {/* soft background blobs (fixed, so they stay put while scrolling) */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-violet-600/30 blur-[90px]" />
        <div className="absolute -right-28 top-1/3 h-72 w-72 rounded-full bg-fuchsia-600/20 blur-[90px]" />
        <div className="absolute -bottom-32 left-1/4 h-80 w-80 rounded-full bg-indigo-600/25 blur-[100px]" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-md px-4 pb-28">
        <TopBar credits={credits} />

        <main className="space-y-3">
          <BalanceCard credits={credits} />

          <GameModeTabs value={duration} onChange={setDuration} />

          <RoundInfoCard
            history={history}
            timeLeft={timeLeft}
            roundDuration={duration}
            isLocked={isLocked}
            period={period}
          />

          <p className="px-1 text-center text-xs text-white/40">
            Place your bet before the last 5 seconds. Betting closes then and
            the result is shown when the timer ends.
          </p>

          <BetPanel
            credits={credits}
            isLocked={isLocked}
            timeLeft={timeLeft}
            currentBets={currentBets}
            onPlaceBet={placeBet}
          />

          <HistoryTabs history={history} betHistory={betHistory} />
        </main>
      </div>

      {/* both popups close themselves after 5 seconds; the player can also close them */}
      <WinCelebrationModal
        visible={popupOpen && popup?.type === "win"}
        amount={popup?.amount}
        colors={popup?.colors}
        number={popup?.number}
        size={popup?.size}
        gameName={gameName}
        period={popup?.period}
        onClose={closePopup}
      />
      <LoseModal
        visible={popupOpen && popup?.type === "lose"}
        lossAmount={popup?.amount}
        colors={popup?.colors}
        number={popup?.number}
        size={popup?.size}
        gameName={gameName}
        period={popup?.period}
        onClose={closePopup}
      />

      <BottomNav />
    </div>
  );
}
