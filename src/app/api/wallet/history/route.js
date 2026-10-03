import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth/session';

/**
 * app/api/wallet/history/route.js
 * GET /api/wallet/history?kind=deposit|withdraw&status=&range=24h|7d|30d|all&page=1
 *
 * Assumes deposits are saved as CREDIT and withdrawals as DEBIT transactions.
 * Always filtered by the logged-in user, straight from the database.
 */
const KIND_TO_TYPE = { deposit: 'CREDIT', withdraw: 'DEBIT' };
const STATUSES = ['PENDING', 'SUCCESS', 'FAILED', 'CANCELLED', 'REFUNDED'];
const RANGE_DAYS = { '24h': 1, '7d': 7, '30d': 30 };
const PAGE_SIZE = 15;

export async function GET(request) {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const type = KIND_TO_TYPE[searchParams.get('kind')];
    if (!type) return NextResponse.json({ message: 'Invalid kind' }, { status: 400 });

    const status = searchParams.get('status');
    if (status && !STATUSES.includes(status)) {
        return NextResponse.json({ message: 'Invalid status' }, { status: 400 });
    }

    const range = searchParams.get('range') || '30d';
    const page = Math.max(Number(searchParams.get('page')) || 1, 1);

    const where = { userId: user.id, type };
    if (status) where.status = status;
    if (RANGE_DAYS[range]) {
        where.transactionDate = { gte: new Date(Date.now() - RANGE_DAYS[range] * 86_400_000) };
    }

    const [rows, agg] = await Promise.all([
        prisma.transaction.findMany({
            where,
            orderBy: [{ transactionDate: 'desc' }, { id: 'desc' }],
            skip: (page - 1) * PAGE_SIZE,
            take: PAGE_SIZE + 1, // one extra row tells us if there is another page
            select: {
                id: true,
                amount: true,
                status: true,
                paymentMethod: true,
                referenceId: true,
                transactionNumber: true,
                description: true,
                transactionDate: true,
            },
        }),
        page === 1
            ? prisma.transaction.aggregate({
                where: { ...where, status: 'SUCCESS' },
                _sum: { amount: true },
                _count: true,
            })
            : null,
    ]);

    const hasMore = rows.length > PAGE_SIZE;
    const items = rows.slice(0, PAGE_SIZE).map((r) => ({
        ...r,
        amount: Number(r.amount),
        transactionDate: r.transactionDate.toISOString(),
    }));

    return NextResponse.json({
        items,
        hasMore,
        page,
        summary: agg
            ? { successTotal: Number(agg._sum.amount ?? 0), successCount: agg._count }
            : null,
    });
}