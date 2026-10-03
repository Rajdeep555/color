import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session';
import { DURATIONS, getRecentResults } from '@/lib/game/rounds';

/**
 * app/api/game/rounds/route.js
 * GET /api/game/rounds?duration=30&limit=10
 * Same recent results for every player, read from the database.
 */
export async function GET(request) {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const duration = Number(searchParams.get('duration'));
    if (!DURATIONS.includes(duration)) {
        return NextResponse.json({ message: 'Invalid duration' }, { status: 400 });
    }
    const limit = Math.min(Math.max(Number(searchParams.get('limit')) || 10, 1), 30);

    const { current, results } = await getRecentResults(duration, limit);

    return NextResponse.json(
        {
            serverTime: Date.now(),
            current: { period: current.period, endsAt: current.endsAt },
            results,
        },
        { headers: { 'Cache-Control': 'no-store' } }
    );
}