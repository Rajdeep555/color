import { randomInt } from 'node:crypto';
import { prisma } from '@/lib/prisma';
import { DURATIONS, roundAt, numberMeta, betWins, betPayout } from '@/lib/game/clock';

export { DURATIONS, roundAt, numberMeta };

/**
 * lib/game/rounds.js  (server only)
 * One result per (duration, period), stored in the database and shared by
 * every player. Bets are settled against that same stored result.
 *
 * The result of a round is picked (secure random digit) the moment the round
 * starts, before any bet is placed, and is only revealed once betting closes.
 */

/** Create the result for each period if it does not exist yet, then return them. */
async function ensureResults(duration, periods) {
    await prisma.gameRound.createMany({
        data: periods.map((period) => ({ duration, period, number: randomInt(0, 10) })),
        skipDuplicates: true, // unique (duration, period): one result per round, ever
    });
    return prisma.gameRound.findMany({
        where: { duration, period: { in: periods } },
        select: { period: true, number: true },
    });
}

const g = globalThis;
const resultsCache = g.__roundsCache ?? (g.__roundsCache = new Map());
const currentCache = g.__currentResultCache ?? (g.__currentResultCache = new Map());
const settledCache = g.__settledCache ?? (g.__settledCache = new Map());
const settling = g.__settling ?? (g.__settling = new Set());

/** Results of the last `limit` finished rounds (newest first). */
export async function getRecentResults(duration, limit = 10) {
    const current = roundAt(duration);
    const key = `${duration}:${limit}`;
    const hit = resultsCache.get(key);
    if (hit && hit.period === current.period) return { current, results: hit.results };

    const ms = duration * 1000;
    const periods = [];
    for (let j = 1; j <= limit; j++) periods.push(roundAt(duration, current.startsAt - j * ms).period);

    const rows = await ensureResults(duration, periods);
    rows.sort((a, b) => (a.period < b.period ? 1 : -1));
    const results = rows.map((r) => ({ period: r.period, ...numberMeta(r.number) }));

    resultsCache.set(key, { period: current.period, results });
    return { current, results };
}

/**
 * The result of the round that is running right now. It is created at the start
 * of the round and kept in memory; callers must only reveal it once betting has
 * closed (see /api/game/upcoming).
 */
export async function ensureCurrentResult(duration) {
    const current = roundAt(duration);
    const key = `${duration}:${current.period}`;
    const hit = currentCache.get(key);
    if (hit) return { current, result: hit };

    const rows = await ensureResults(duration, [current.period]);
    const result = { period: current.period, ...numberMeta(rows[0].number) };

    currentCache.set(key, result);
    if (currentCache.size > 40) currentCache.delete(currentCache.keys().next().value);
    return { current, result };
}

/** Settle pending bets of ended rounds (optionally only one player's). */
async function settleBets(duration, userId) {
    const current = roundAt(duration);

    for (let i = 0; i < 20; i++) {
        const pending = await prisma.bet.findMany({
            where: {
                duration,
                status: 'PENDING',
                period: { lt: current.period },
                ...(userId ? { userId } : {}),
            },
            orderBy: { createdAt: 'asc' },
            take: 500,
        });
        if (pending.length === 0) break;

        const periods = [...new Set(pending.map((b) => b.period))];
        const rows = await ensureResults(duration, periods);
        const numberOf = new Map(rows.map((r) => [r.period, r.number]));

        for (const bet of pending) {
            const number = numberOf.get(bet.period);
            if (number === undefined) continue;

            const won = betWins(bet, number);
            const payout = won ? betPayout(bet) : 0;

            await prisma.$transaction(
                async (tx) => {
                    const done = await tx.bet.updateMany({
                        where: { id: bet.id, status: 'PENDING' }, // each bet is settled once
                        data: { status: won ? 'WON' : 'LOST', payout, settledAt: new Date() },
                    });
                    if (done.count === 1 && won) {
                        await tx.user.update({
                            where: { id: bet.userId },
                            data: { balance: { increment: payout } },
                        });
                    }
                },
                { timeout: 15000 }
            );
        }
        if (pending.length < 500) break;
    }
}

/** Fast path: settle just this player's finished bets (a handful of rows). */
export function settleUserDue(userId, duration) {
    return settleBets(duration, userId);
}

/** Settle everybody's finished bets. Runs at most once per round per server. */
export async function settleDue(duration) {
    const current = roundAt(duration);
    if (settledCache.get(duration) === current.period || settling.has(duration)) return;

    settling.add(duration);
    try {
        await settleBets(duration);
        settledCache.set(duration, current.period);
    } finally {
        settling.delete(duration);
    }
}