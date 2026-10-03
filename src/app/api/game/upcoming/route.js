import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session';
import { DURATIONS, roundAt, ensureCurrentResult } from '@/lib/game/rounds';
import { LOCK_SECONDS } from '@/lib/game/clock';

/**
 * app/api/game/upcoming/route.js
 * GET /api/game/upcoming?duration=30
 * Returns the result of the CURRENT round, but only after betting has closed
 * (last 5 seconds). The browser holds it and shows it when the timer ends,
 * so nothing has to be fetched at the moment the round finishes.
 */
export async function GET(request) {
    const session = await getSessionUser();
    if (!session) return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });

    const duration = Number(new URL(request.url).searchParams.get('duration'));
    if (!DURATIONS.includes(duration)) {
        return NextResponse.json({ message: 'Invalid duration' }, { status: 400 });
    }

    const now = Date.now();
    const round = roundAt(duration, now);

    // Never reveal anything while bets can still be placed
    if (round.endsAt - now > LOCK_SECONDS * 1000) {
        return NextResponse.json({ message: 'Betting is still open' }, { status: 425 });
    }

    const { result } = await ensureCurrentResult(duration);
    return NextResponse.json(result, { headers: { 'Cache-Control': 'no-store' } });
}