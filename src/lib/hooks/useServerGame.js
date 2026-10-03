"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { roundAt, LOCK_SECONDS, betWins, betPayout } from "@/lib/game/clock";

/**
 * The whole game screen state, driven by the server:
 *  - the clock and Game ID are computed from SERVER time, so every player sees
 *    the same Game ID and countdown;
 *  - the round's result is fetched once betting closes (last 5 seconds) and held
 *    in memory, then shown the instant the timer reaches zero (no waiting);
 *  - balance, bets and payouts are confirmed with the server right after.
 */
export function useServerGame() {
    const [duration, setDurationState] = useState(30);
    const [credits, setCredits] = useState(0);
    const [history, setHistory] = useState([]);
    const [currentBets, setCurrentBets] = useState([]);
    const [betHistory, setBetHistory] = useState([]);
    const [lastResult, setLastResult] = useState(null);
    const [clock, setClock] = useState({ period: "", timeLeft: 0 });

    const durationRef = useRef(duration);
    const periodRef = useRef("");
    const offsetRef = useRef(0); // serverTime - deviceTime
    const firstLoad = useRef(true);
    const upcomingRef = useRef(null); // result of the running round, once betting closed
    const lastPeriod = useRef("");
    const currentBetsRef = useRef([]);
    currentBetsRef.current = currentBets;

    const loadBets = useCallback(async () => {
        try {
            const res = await fetch("/api/game/bets?limit=30", { cache: "no-store" });
            if (!res.ok) return;
            const data = await res.json();
            setBetHistory(data.bets ?? []);
        } catch { }
    }, []);

    const sync = useCallback(async () => {
        const dur = durationRef.current;
        try {
            const res = await fetch(`/api/game/state?duration=${dur}`, {
                cache: "no-store",
            });
            const receivedAt = Date.now();
            if (!res.ok) return;
            const data = await res.json();
            if (dur !== durationRef.current) return; // length changed while loading

            // server timestamp is taken just before the reply is sent
            offsetRef.current = data.serverTime - receivedAt;

            setCredits(data.balance);
            setHistory(data.results ?? []);
            setCurrentBets(data.bets ?? []);

            // do not replay the previous round's win/lose popup on first load
            if (!firstLoad.current && data.last) setLastResult(data.last);
            if (firstLoad.current || data.last?.hadBets) loadBets();
            firstLoad.current = false;
        } catch { }
    }, [loadBets]);

    // tick: compute period + seconds left from the (server-corrected) clock
    useEffect(() => {
        durationRef.current = duration;
        const tick = () => {
            const now = Date.now() + offsetRef.current;
            const r = roundAt(duration, now);
            const timeLeft = Math.max(0, Math.ceil((r.endsAt - now) / 1000));
            periodRef.current = r.period;
            setClock((prev) =>
                prev.period === r.period && prev.timeLeft === timeLeft
                    ? prev
                    : { period: r.period, timeLeft },
            );
        };
        tick();
        const id = setInterval(tick, 200);
        return () => clearInterval(id);
    }, [duration]);

    // load everything on mount and whenever the round length changes
    useEffect(() => {
        firstLoad.current = true;
        sync();
    }, [duration, sync]);

    const isLocked = clock.timeLeft <= LOCK_SECONDS;

    // Betting just closed: fetch this round's result now and keep it hidden in memory
    useEffect(() => {
        if (!isLocked || !clock.period) return;
        const target = clock.period;
        if (upcomingRef.current?.period === target) return;

        let cancelled = false;
        let timer;
        const attempt = async () => {
            try {
                const res = await fetch(
                    `/api/game/upcoming?duration=${durationRef.current}`,
                    { cache: "no-store" },
                );
                if (res.ok) {
                    const d = await res.json();
                    if (d.period === target) {
                        upcomingRef.current = d;
                        return;
                    }
                }
            } catch { }
            if (!cancelled) timer = setTimeout(attempt, 700);
        };
        attempt();
        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, [isLocked, clock.period]);

    // Timer hit zero: show the held result instantly, then confirm with the server
    useEffect(() => {
        if (!clock.period) return;
        const ended = lastPeriod.current;
        lastPeriod.current = clock.period;
        if (!ended || ended === clock.period) return;

        const held = upcomingRef.current?.period === ended ? upcomingRef.current : null;
        if (held) {
            setHistory((prev) =>
                [
                    { period: held.period, number: held.number, colors: held.colors, isBig: held.isBig },
                    ...prev.filter((r) => r.period !== ended),
                ].slice(0, 10),
            );

            const bets = currentBetsRef.current;
            if (bets.length > 0) {
                const winAmount = bets.reduce(
                    (sum, b) => (betWins(b, held.number) ? sum + betPayout(b) : sum),
                    0,
                );
                setLastResult({ period: ended, hadBets: true, winAmount });
                if (winAmount > 0) setCredits((c) => c + winAmount); // server confirms below
            }
        }
        setCurrentBets([]);

        // fallback + confirmation: real balance, payouts and bets from the database
        const t = setTimeout(sync, 500);
        return () => clearTimeout(t);
    }, [clock.period, sync]);

    // coming back to the tab: re-sync the clock straight away
    useEffect(() => {
        const onVisible = () => document.visibilityState === "visible" && sync();
        document.addEventListener("visibilitychange", onVisible);
        return () => document.removeEventListener("visibilitychange", onVisible);
    }, [sync]);

    const setDuration = useCallback((next) => {
        if (next === durationRef.current) return;
        durationRef.current = next;
        lastPeriod.current = "";
        upcomingRef.current = null;
        setHistory([]);
        setCurrentBets([]);
        setLastResult(null);
        setDurationState(next);
    }, []);

    const placeBet = useCallback(
        async ({ type, value, amount }) => {
            try {
                const res = await fetch("/api/game/bets", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        duration: durationRef.current,
                        type,
                        value,
                        amount,
                    }),
                });
                const data = await res.json().catch(() => ({}));
                if (!res.ok || !data.ok) {
                    return { ok: false, reason: data.reason || "Could not place the bet." };
                }

                setCredits(data.balance);
                if (data.period === periodRef.current) {
                    setCurrentBets((prev) => [...prev, { type, value, amount }]);
                } else {
                    sync(); // the round changed while the bet was in flight
                }
                loadBets();
                return { ok: true };
            } catch {
                return { ok: false, reason: "Network error. Please try again." };
            }
        },
        [loadBets, sync],
    );

    return {
        duration,
        setDuration,
        credits,
        period: clock.period,
        timeLeft: clock.timeLeft,
        isLocked,
        history,
        currentBets,
        betHistory,
        lastResult,
        placeBet,
    };
}