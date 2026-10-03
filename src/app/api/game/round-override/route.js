import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session';
import { getOverride } from '@/lib/game/overrideCache';

/**
 * app/api/game/round-override/route.js
 * GET /api/game/round-override?duration=30
 * Returns the active override for that duration, or null (use the default).
 * No database hit for auth (cached) and one shared query per 2s for the override.
 */
export async function GET(request) {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const duration = Number(searchParams.get('duration'));
    if (!duration) return NextResponse.json({ message: 'Missing duration' }, { status: 400 });

    const override = await getOverride(duration);
    return NextResponse.json({ override });
}