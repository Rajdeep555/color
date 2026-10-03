'use client';

import { create } from 'zustand';

const LOCK_BEFORE_RESULT = 5;
const COLOR_MULTIPLIER = { red: 2, green: 2, violet: 4.5 };
const NUMBER_MULTIPLIER = 9;
const BIG_SMALL_MULTIPLIER = 2;

export const GAME_MODES = [
    { label: '30 Sec', seconds: 30 },
    { label: '1 Min', seconds: 60 },
    { label: '5 Min', seconds: 300 },
    { label: '10 Min', seconds: 600 },
];

export function resolveColors(number) {
    if (number === 0) return ['red', 'violet'];
    if (number === 5) return ['green', 'violet'];
    const greens = [1, 3, 7, 9];
    return greens.includes(number) ? ['green'] : ['red'];
}

function payoutForNumber(candidate, currentBets) {
    const candidateColors = resolveColors(candidate);
    const candidateIsBig = candidate >= 5;
    let total = 0;
    for (const bet of currentBets) {
        if (bet.type === 'color' && candidateColors.includes(bet.value)) {
            total += bet.amount * COLOR_MULTIPLIER[bet.value];
        } else if (bet.type === 'number' && bet.value === candidate) {
            total += bet.amount * NUMBER_MULTIPLIER;
        } else if (bet.type === 'bigsmall' && (bet.value === 'big') === candidateIsBig) {
            total += bet.amount * BIG_SMALL_MULTIPLIER;
        }
    }
    return total;
}

/**
 * DEFAULT outcome: whichever number results in the LEAST total payout
 * across this session's current bets wins — i.e. the option(s) with the
 * least staked on them. If nothing was bet, pick truly at random.
 */
function pickLeastCostNumber(currentBets) {
    if (currentBets.length === 0) return Math.floor(Math.random() * 10);

    let best = [];
    let bestPayout = Infinity;
    for (let n = 0; n <= 9; n++) {
        const payout = payoutForNumber(n, currentBets);
        if (payout < bestPayout) {
            bestPayout = payout;
            best = [n];
        } else if (payout === bestPayout) {
            best.push(n);
        }
    }
    return best[Math.floor(Math.random() * best.length)];
}

/** Admin override: force a specific number, or the least-cost number within a chosen color/big-small. */
function resolveOverrideToNumber(override, currentBets) {
    if (override.overrideType === 'number') {
        return Number(override.overrideValue);
    }

    const candidates = [];
    for (let n = 0; n <= 9; n++) {
        if (override.overrideType === 'color' && resolveColors(n).includes(override.overrideValue)) {
            candidates.push(n);
        } else if (override.overrideType === 'bigsmall') {
            const isBig = n >= 5;
            if ((override.overrideValue === 'big') === isBig) candidates.push(n);
        }
    }
    if (candidates.length === 0) return pickLeastCostNumber(currentBets);

    let best = candidates[0];
    let bestPayout = Infinity;
    for (const n of candidates) {
        const payout = payoutForNumber(n, currentBets);
        if (payout < bestPayout) {
            bestPayout = payout;
            best = n;
        }
    }
    return best;
}

let intervalId = null;

export const useGameStore = create((set, get) => ({
    credits: 0,
    _lastServerBalance: null,
    period: 1000000,
    roundDuration: GAME_MODES[0].seconds,
    timeLeft: GAME_MODES[0].seconds,
    isLocked: false,
    currentBets: [],
    history: [],
    betHistory: [],
    withdrawHistory: [],
    lastResult: null,

    setCredits: (amount) => set({ credits: amount, _lastServerBalance: amount }),

    addWithdrawalRecord: (entry) => {
        set((state) => ({ withdrawHistory: [entry, ...state.withdrawHistory].slice(0, 10) }));
    },

    setRoundDuration: (seconds) => {
        set({ roundDuration: seconds, timeLeft: seconds, isLocked: false, currentBets: [] });
    },

    placeBet: (bet) => {
        const { isLocked, credits, currentBets } = get();
        if (isLocked) return { ok: false, reason: 'Betting is closed for this round.' };

        const alreadyBooked = currentBets.some((b) => b.type === bet.type && b.value === bet.value);
        if (alreadyBooked) return { ok: false, reason: 'You already picked this — wait for the next round.' };

        if (bet.amount <= 0 || bet.amount > credits) {
            return { ok: false, reason: 'Insufficient balance.' };
        }

        set((state) => ({
            credits: state.credits - bet.amount,
            currentBets: [...state.currentBets, bet],
        }));

        return { ok: true };
    },

    startEngine: () => {
        if (intervalId) return;
        set({ period: Number(`${Date.now()}`.slice(-8)) });

        intervalId = setInterval(async () => {
            const { timeLeft } = get();

            if (timeLeft > 1) {
                set({ timeLeft: timeLeft - 1, isLocked: timeLeft - 1 <= LOCK_BEFORE_RESULT });
                return;
            }

            const { currentBets, period, roundDuration } = get();

            let number;
            try {
                const res = await fetch(`/api/game/round-override?duration=${roundDuration}`);
                const data = res.ok ? await res.json() : null;
                number = data?.override
                    ? resolveOverrideToNumber(data.override, currentBets)
                    : pickLeastCostNumber(currentBets);
            } catch {
                number = pickLeastCostNumber(currentBets);
            }

            const colors = resolveColors(number);
            const isBig = number >= 5;

            const resolvedBets = currentBets.map((bet, i) => {
                let won = false;
                let multiplier = 0;
                if (bet.type === 'color' && colors.includes(bet.value)) {
                    won = true;
                    multiplier = COLOR_MULTIPLIER[bet.value];
                } else if (bet.type === 'number' && bet.value === number) {
                    won = true;
                    multiplier = NUMBER_MULTIPLIER;
                } else if (bet.type === 'bigsmall' && (bet.value === 'big') === isBig) {
                    won = true;
                    multiplier = BIG_SMALL_MULTIPLIER;
                }
                const payout = won ? bet.amount * multiplier : 0;
                return { id: `${period}-${i}`, period, type: bet.type, value: bet.value, amount: bet.amount, won, payout };
            });

            const totalWinnings = resolvedBets.reduce((sum, b) => sum + b.payout, 0);
            const result = {
                period,
                number,
                colors,
                isBig,
                winAmount: totalWinnings,
                hadBets: resolvedBets.length > 0,
            };

            set((state) => ({
                credits: state.credits + totalWinnings,
                currentBets: [],
                period: state.period + 1,
                timeLeft: roundDuration,
                isLocked: false,
                lastResult: result,
                history: [{ period, number, colors, isBig }, ...state.history].slice(0, 20),
                betHistory: [...resolvedBets, ...state.betHistory].slice(0, 30),
            }));
        }, 1000);
    },

    stopEngine: () => {
        if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
        }
    },
}));