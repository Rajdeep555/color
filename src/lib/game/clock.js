/**
 * lib/game/clock.js
 * Pure game maths, shared by the server and the browser (no database here).
 * The Game ID, the start/end of every round, the colors of a number and the
 * win/payout rules all live here, so both sides always agree.
 */

export const GAME_MODES = [
    { seconds: 30, label: "30 Sec" },
    { seconds: 60, label: "1 Min" },
    { seconds: 300, label: "5 Min" },
    { seconds: 600, label: "10 Min" },
];

export const DURATIONS = GAME_MODES.map((m) => m.seconds);
export const LOCK_SECONDS = 5; // betting closes this many seconds before the end

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000; // India, no daylight saving
const DAY_MS = 86_400_000;
const p2 = (n) => String(n).padStart(2, "0");

/** The round that contains `nowMs`. Game ID = YYMMDD + round number of the day (IST). */
export function roundAt(duration, nowMs = Date.now()) {
    const ms = duration * 1000;
    const local = nowMs + IST_OFFSET_MS;
    const dayStartLocal = Math.floor(local / DAY_MS) * DAY_MS;
    const index = Math.floor((local - dayStartLocal) / ms);
    const d = new Date(dayStartLocal);
    const ymd = `${p2(d.getUTCFullYear() % 100)}${p2(d.getUTCMonth() + 1)}${p2(d.getUTCDate())}`;
    const startsAt = dayStartLocal - IST_OFFSET_MS + index * ms;
    return {
        period: `${ymd}${String(index).padStart(4, "0")}`,
        startsAt,
        endsAt: startsAt + ms,
    };
}

/** 0 = red+violet, 5 = green+violet, odd = green, even = red. 5-9 is big. */
export function numberMeta(n) {
    const colors =
        n === 0 ? ["red", "violet"] : n === 5 ? ["green", "violet"] : n % 2 ? ["green"] : ["red"];
    return { number: n, colors, isBig: n >= 5 };
}

// Payout multipliers (what the bet panel shows). Edit here if your rules differ.
const RATES = { green: 2, red: 2, violet: 4.5, big: 2, small: 2 };
const NUMBER_RATE = 9;

export const betRate = (bet) =>
    bet.type === "number" ? NUMBER_RATE : (RATES[bet.value] ?? 0);

export function betWins(bet, number) {
    const meta = numberMeta(number);
    if (bet.type === "color") return meta.colors.includes(bet.value);
    if (bet.type === "bigsmall") return bet.value === (meta.isBig ? "big" : "small");
    if (bet.type === "number") return Number(bet.value) === number;
    return false;
}

/** What a winning bet pays back (stake x rate), rounded to paise. */
export const betPayout = (bet) =>
    Math.round(Number(bet.amount) * betRate(bet) * 100) / 100;