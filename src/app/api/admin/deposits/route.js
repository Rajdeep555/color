import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth/session';

/**
 * GET /api/admin/deposits — all deposit requests (pending, completed, failed).
 * The admin page splits them into tabs.
 */
export async function GET() {
    const admin = await getCurrentUser();
    if (!admin || admin.role !== 'ADMIN') {
        return NextResponse.json({ message: 'Not authorized' }, { status: 403 });
    }

    const rows = await prisma.transaction.findMany({
        where: { type: 'CREDIT' }, // no status filter, so every status comes back
        include: {
            user: { select: { id: true, name: true, email: true, phone: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 1000,
    });

    const deposits = rows.map((r) => ({
        id: r.id,
        amount: Number(r.amount),
        status: r.status,
        referenceId: r.referenceId,
        description: r.description,
        paymentMethod: r.paymentMethod,
        createdAt: r.createdAt,
        user: r.user,
    }));

    return NextResponse.json({ deposits });
}