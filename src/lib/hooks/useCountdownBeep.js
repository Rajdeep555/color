'use client';

import { useEffect, useRef } from 'react';

// Master loudness: 0.15 was the old value. 0.9 is roughly 15 dB louder.
// Keep this at or below ~1 to avoid clipping/distortion.
const VOLUME = 0.9;

/**
 * Plays a beep on every second while isLocked is true (the final 5 seconds
 * of a round). Synthesized with the Web Audio API, so no audio file is needed.
 * The last second (timeLeft === 1) is higher pitched and longer so it reads
 * as "about to resolve."
 *
 * A triangle wave is used instead of a sine: it has extra harmonics, so it
 * sounds noticeably louder and cuts through on small phone speakers.
 *
 * Some browsers start AudioContext suspended until a user gesture has
 * happened on the page - placing a bet is a tap/click, so that is already
 * satisfied in normal use.
 */
export function useCountdownBeep(timeLeft, isLocked) {
    const audioCtxRef = useRef(null);

    useEffect(() => {
        if (!isLocked) return;

        if (!audioCtxRef.current) {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (!AudioContextClass) return; // unsupported browser - fail silently
            audioCtxRef.current = new AudioContextClass();
        }
        const ctx = audioCtxRef.current;
        if (ctx.state === 'suspended') ctx.resume();

        const isFinal = timeLeft === 1;
        const duration = isFinal ? 0.4 : 0.22;
        const now = ctx.currentTime;

        const oscillator = ctx.createOscillator();
        const gain = ctx.createGain();
        // Compressor keeps the louder tone from clipping.
        const compressor = ctx.createDynamicsCompressor();

        oscillator.type = 'triangle';
        oscillator.frequency.value = isFinal ? 1174.7 : 880; // higher pitch on the final second

        // Quick attack (avoids a click), hold, then fade out.
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(VOLUME, now + 0.01);
        gain.gain.setValueAtTime(VOLUME, now + duration * 0.6);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        oscillator.connect(gain);
        gain.connect(compressor);
        compressor.connect(ctx.destination);
        oscillator.start(now);
        oscillator.stop(now + duration);
    }, [timeLeft, isLocked]);
}