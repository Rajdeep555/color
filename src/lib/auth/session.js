import { cache } from 'react';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth/jwt';
import { prisma } from '@/lib/prisma';

/**
 * lib/auth/session.js
 *
 * getSessionUser()  -> id / name / email / role / isActive. Cached 30s in memory,
 *                      so routes that only need "who is this + are they allowed"
 *                      (round-override, admin checks) do NOT hit the database.
 * getCurrentUser()  -> same as above + a fresh balance (one tiny query).
 *
 * Both are also wrapped in React cache(), so calling them several times
 * inside one request only runs once.
 */

const AUTH_TTL_MS = 30_000;
const g = globalThis;
const authCache = g.__authCache ?? (g.__authCache = new Map());

async function loadAuthUser(userId) {
    const hit = authCache.get(userId);
    if (hit && hit.exp > Date.now()) return hit.user;

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, email: true, role: true, isActive: true },
    });

    authCache.set(userId, { user, exp: Date.now() + AUTH_TTL_MS });
    return user;
}

/** Call this right after you block / unblock a user or change their role. */
export function invalidateAuthUser(userId) {
    authCache.delete(userId);
}

export const getSessionUser = cache(async () => {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return null;

    const payload = await verifyToken(token);
    if (!payload?.userId) return null;

    const user = await loadAuthUser(payload.userId);
    if (!user || !user.isActive) return null;
    return user;
});

export const getCurrentUser = cache(async () => {
    const user = await getSessionUser();
    if (!user) return null;

    const row = await prisma.user.findUnique({
        where: { id: user.id },
        select: { balance: true },
    });
    if (!row) return null;

    return { ...user, balance: row.balance };
});