import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth/session';
import { DURATIONS, roundAt } from '@/lib/game/rounds';
import { LOCK_SECONDS } from '@/lib/game/clock';

/**
 * app/api/game/bets/route.js
 * POST — place a bet. The server checks the clock and takes the money
 *        from the wallet in the same database transaction.
 * GET  — this player's bets (newest first) with totals and balance.
 */
const COLORS = ['green', 'violet', 'red'];
const SIZES = ['big', 'small'];
const MAX_STAKE = 50_000;

const fail = (reason, status = 400) => NextResponse.json({ ok: false, reason }, { status });
const valueOf = (b) => (b.type === 'number' ? Number(b.value) : b.value);

export async function POST(request) {
    const session = await getSessionUser();
    if (!session) return fail('Please log in again.', 401);

    const body = await request.json().catch(() => ({}));
    const { duration, type, value } = body;
    const amount = Number(body.amount);

    if (!DURATIONS.includes(duration)) return fail('Invalid round length.');
    const validValue =
        (type === 'color' && COLORS.includes(value)) ||
        (type === 'bigsmall' && SIZES.includes(value)) ||
        (type === 'number' && Number.isInteger(value) && value >= 0 && value <= 9);
    if (!validValue) return fail('Invalid bet.');
    if (!Number.isInteger(amount) || amount < 1 || amount > MAX_STAKE) {
        return fail(`Bet must be between ₹1 and ₹${MAX_STAKE.toLocaleString('en-IN')}.`);
    }

    // The server clock decides whether betting is still open
    const now = Date.now();
    const round = roundAt(duration, now);
    if (round.endsAt - now <= LOCK_SECONDS * 1000) return fail('Betting is closed for this round.');

    try {
        const result = await prisma.$transaction(
            async (tx) => {
                const debit = await tx.user.updateMany({
                    where: { id: session.id, isActive: true, balance: { gte: amount } },
                    data: { balance: { decrement: amount } },
                });
                if (debit.count === 0) return { error: 'Insufficient balance.' };

                await tx.bet.create({
                    data: {
                        userId: session.id,
                        duration,
                        period: round.period,
                        type,
                        value: String(value),
                        amount,
                    },
                });
                const user = await tx.user.findUnique({
                    where: { id: session.id },
                    select: { balance: true },
                });
                return { balance: Number(user.balance) };
            },
            { timeout: 15000 }
        );

        if (result.error) return fail(result.error);
        return NextResponse.json({ ok: true, balance: result.balance, period: round.period });
    } catch (e) {
        if (e?.code === 'P2002') return fail('You already booked this option in this round.', 409);
        console.error('place bet failed', e);
        return fail('Could not place the bet. Please try again.', 500);
    }
}

export async function GET(request) {
    const session = await getSessionUser();
    if (!session) return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });

    const limit = Math.min(Math.max(Number(new URL(request.url).searchParams.get('limit')) || 30, 1), 100);

    const [rows, total, wins, won, user] = await Promise.all([
        prisma.bet.findMany({
            where: { userId: session.id },
            orderBy: { createdAt: 'desc' },
            take: limit,
        }),
        prisma.bet.count({ where: { userId: session.id } }),
        prisma.bet.count({ where: { userId: session.id, status: 'WON' } }),
        prisma.bet.aggregate({
            where: { userId: session.id, status: 'WON' },
            _sum: { payout: true },
        }),
        prisma.user.findUnique({ where: { id: session.id }, select: { balance: true } }),
    ]);

    return NextResponse.json(
        {
            balance: Number(user?.balance ?? 0),
            summary: { count: total, wins, totalWon: Number(won._sum.payout ?? 0) },
            bets: rows.map((b) => ({
                id: b.id,
                period: b.period,
                duration: b.duration,
                type: b.type,
                value: valueOf(b),
                amount: Number(b.amount),
                status: b.status,
                won: b.status === 'WON',
                payout: Number(b.payout),
                createdAt: b.createdAt.toISOString(),
            })),
        },
        { headers: { 'Cache-Control': 'no-store' } }
    );
}