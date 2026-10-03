'use client';

import { useEffect, useRef } from 'react';

/**
 * Plays a short beep on every second while isLocked is true (the final
 * 5 seconds of a round). Uses the Web Audio API to synthesize the tone —
 * no audio file needed. The last second (timeLeft === 1) gets a slightly
 * higher pitch so it reads as "about to resolve."
 *
 * Some browsers start AudioContext suspended until a user gesture has
 * happened on the page — since placing a bet is a tap/click, that
 * requirement is already satisfied in normal use.
 */
export function useCountdownBeep(timeLeft, isLocked) {
    const audioCtxRef = useRef(null);

    useEffect(() => {
        if (!isLocked) return;

        if (!audioCtxRef.current) {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (!AudioContextClass) return; // unsupported browser — fail silently
            audioCtxRef.current = new AudioContextClass();
        }
        const ctx = audioCtxRef.current;
        if (ctx.state === 'suspended') ctx.resume();

        const oscillator = ctx.createOscillator();
        const gain = ctx.createGain();

        oscillator.type = 'sine';
        oscillator.frequency.value = timeLeft === 1 ? 1046.5 : 784; // higher pitch on the final second

        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

        oscillator.connect(gain);
        gain.connect(ctx.destination);
        oscillator.start();
        oscillator.stop(ctx.currentTime + 0.15);
    }, [timeLeft, isLocked]);
}