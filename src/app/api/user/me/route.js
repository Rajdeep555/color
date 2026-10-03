import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';

/**
 * app/api/user/me/route.js
 * GET /api/user/me — returns the logged-in user's public profile + balance.
 */
export async function GET() {
    const user = await getCurrentUser();
    if (!user) {
        return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }
    return NextResponse.json({ user });
}