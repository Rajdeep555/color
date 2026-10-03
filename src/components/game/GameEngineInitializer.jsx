"use client";

import { useEffect } from "react";
import { useGameStore } from "@/store/gameStore";

const POLL_INTERVAL = 20000; // ms

/**
 * Mounted once in (user)/layout.js. Starts the round timer, and keeps
 * credits in sync with the server.
 *
 * Betting is still local-only (not yet synced to the DB), so this can't
 * just overwrite credits on every poll — that would wipe out in-round
 * win/loss changes. Instead it tracks the last known SERVER balance and
 * applies only the delta (e.g. an admin confirming a deposit shows up
 * as a +30 delta, applied on top of whatever local credits currently is).
 */
export default function GameEngineInitializer() {
  const startEngine = useGameStore((s) => s.startEngine);
  const setCredits = useGameStore((s) => s.setCredits);

  useEffect(() => {
    startEngine();

    const syncBalance = async () => {
      try {
        const res = await fetch("/api/user/me");
        if (!res.ok) return;
        const data = await res.json();
        const serverBalance = Number(data.user.balance);

        const { credits, _lastServerBalance } = useGameStore.getState();

        if (_lastServerBalance === null) {
          // first load — no local gameplay changes yet, safe to set directly
          setCredits(serverBalance);
          return;
        }

        const delta = serverBalance - _lastServerBalance;
        if (delta !== 0) {
          useGameStore.setState({
            credits: credits + delta,
            _lastServerBalance: serverBalance,
          });
        }
      } catch {
        // not logged in yet, or request failed
      }
    };

    syncBalance();
    const interval = setInterval(syncBalance, POLL_INTERVAL);
    window.addEventListener("focus", syncBalance);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", syncBalance);
    };
  }, [startEngine, setCredits]);

  return null;
}
