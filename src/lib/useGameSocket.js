"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { API_URL, api, getToken } from "./api";

/**
 * Keeps the current round, countdown and recent results in sync with the server.
 * `settled` is only set when THIS player had bets in a round that just ended,
 * so no polling and no extra API calls are needed for the popups.
 */
export function useGameSocket(mode) {
    const [round, setRound] = useState(null);
    const [recent, setRecent] = useState([]);
    const [settled, setSettled] = useState(null);
    const [, setTick] = useState(0);

    const socketRef = useRef(null);
    const modeRef = useRef(mode);
    const offsetRef = useRef(0); // serverTime - clientTime

    useEffect(() => {
        modeRef.current = mode;
    }, [mode]);

    // connect once
    useEffect(() => {
        const socket = io(API_URL, { auth: { token: getToken() }, transports: ["websocket"] });
        socketRef.current = socket;

        socket.on("connect", () => socket.emit("mode:join", modeRef.current));
        socket.on("round:start", (r) => {
            if (r.mode === modeRef.current) setRound(r);
        });
        socket.on("round:result", (res) => {
            if (res.mode === modeRef.current) setRecent((prev) => [res, ...prev].slice(0, 10));
        });
        socket.on("bet:settled", (s) => setSettled(s));

        return () => socket.disconnect();
    }, []);

    // load state whenever the mode changes
    useEffect(() => {
        let cancelled = false;
        setRound(null);
        setRecent([]);
        socketRef.current?.emit("mode:join", mode);

        api.getState(mode).then((data) => {
            if (cancelled || !data?.ok || !data.round) return;
            offsetRef.current = data.serverTime - Date.now();
            setRound(data.round);
            setRecent(data.recent);
        });

        return () => {
            cancelled = true;
        };
    }, [mode]);

    // re-render twice a second so the countdown stays smooth
    useEffect(() => {
        const id = setInterval(() => setTick((t) => t + 1), 500);
        return () => clearInterval(id);
    }, []);

    const serverNow = Date.now() + offsetRef.current;
    const secondsLeft = round ? Math.max(0, Math.ceil((round.endsAt - serverNow) / 1000)) : 0;
    const locked = !round || serverNow >= round.lockAt;

    const clearSettled = useCallback(() => setSettled(null), []);

    return { round, recent, secondsLeft, locked, settled, clearSettled };
}