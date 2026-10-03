import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth/session';
import {
    DURATIONS,
    roundAt,
    getRecentResults,
    ensureCurrentResult,
    settleUserDue,
    settleDue,
} from '@/lib/game/rounds';

/**
 * app/api/game/state/route.js
 * GET /api/game/state?duration=30
 * Everything the game screen needs, from the server: the clock, the current
 * Game ID, shared recent results, this player's balance and bets.
 */
const valueOf = (b) => (b.type === 'number' ? Number(b.value) : b.value);

export async function GET(request) {
    const session = await getSessionUser();
    if (!session) return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });

    const duration = Number(new URL(request.url).searchParams.get('duration'));
    if (!DURATIONS.includes(duration)) {
        return NextResponse.json({ message: 'Invalid duration' }, { status: 400 });
    }

    // Pay this player first (a few rows, fast). Everyone else is settled in the background.
    await settleUserDue(session.id, duration);
    settleDue(duration).catch((e) => console.error('background settle failed', e));

    const current = roundAt(duration);
    const prev = roundAt(duration, current.startsAt - 1);

    const [user, recent, mine, prevBets] = await Promise.all([
        prisma.user.findUnique({ where: { id: session.id }, select: { balance: true } }),
        getRecentResults(duration, 10),
        prisma.bet.findMany({
            where: { userId: session.id, duration, period: current.period },
            select: { type: true, value: true, amount: true },
        }),
        prisma.bet.findMany({
            where: { userId: session.id, duration, period: prev.period },
            select: { status: true, payout: true },
        }),
        // pick this round's result now (before any bets); it stays hidden until betting closes
        ensureCurrentResult(duration).catch((e) => console.error('ensure result failed', e)),
    ]);

    const settled = prevBets.length > 0 && prevBets.every((b) => b.status !== 'PENDING');

    return NextResponse.json(
        {
            serverTime: Date.now(),
            round: current,
            balance: Number(user?.balance ?? 0),
            results: recent.results,
            bets: mine.map((b) => ({ type: b.type, value: valueOf(b), amount: Number(b.amount) })),
            last: settled
                ? {
                    period: prev.period,
                    hadBets: true,
                    winAmount: prevBets
                        .filter((b) => b.status === 'WON')
                        .reduce((sum, b) => sum + Number(b.payout), 0),
                }
                : null,
        },
        { headers: { 'Cache-Control': 'no-store' } }
    );
}