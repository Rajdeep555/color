"use client";

import { useEffect, useState } from "react";

/**
 * Recent results for a round length, loaded from the database.
 * Refreshes itself right after each server round ends, so every player
 * sees the same list without reloading.
 */
export function useRoundHistory(duration, limit = 10) {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const ctrl = new AbortController();
        let timer;

        setHistory([]);
        setLoading(true);

        async function load() {
            let delay = 5000; // retry delay if something fails
            try {
                const res = await fetch(
                    `/api/game/rounds?duration=${duration}&limit=${limit}`,
                    { signal: ctrl.signal, cache: "no-store" },
                );
                if (res.ok) {
                    const data = await res.json();
                    setHistory(data.results ?? []);
                    // wait until the server's current round ends (+0.7s), measured with
                    // server timestamps only so a wrong phone clock does not matter
                    delay = Math.max(1000, data.current.endsAt - data.serverTime + 700);
                }
            } catch (e) {
                if (e.name === "AbortError") return;
            }
            setLoading(false);
            timer = setTimeout(load, delay);
        }

        load();
        return () => {
            ctrl.abort();
            clearTimeout(timer);
        };
    }, [duration, limit]);

    return { history, loading };
}