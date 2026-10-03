import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth/session';

/**
 * app/api/wallet/transactions/route.js
 * GET /api/wallet/transactions?type=CREDIT|DEBIT
 * Last 30 of the given type for the logged-in user.
 */
export async function GET(request) {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') === 'DEBIT' ? 'DEBIT' : 'CREDIT';

    const transactions = await prisma.transaction.findMany({
        where: { userId: user.id, type },
        orderBy: { createdAt: 'desc' },
        take: 30,
    });

    return NextResponse.json({ transactions });
}