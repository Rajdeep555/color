import { NextResponse } from 'next/server';

/**
 * app/api/auth/logout/route.js
 * POST /api/auth/logout
 * Clears the session cookie by setting it with maxAge: 0.
 */
export async function POST() {
    const response = NextResponse.json({ ok: true });

    response.cookies.set('token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 0,
        path: '/',
    });

    return response;
}