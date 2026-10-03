import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth/session';

/**
 * app/api/admin/deposits/route.js
 * GET /api/admin/deposits — list all pending deposit requests.
 */
export async function GET() {
    const admin = await getCurrentUser();
    if (!admin || admin.role !== 'ADMIN') {
        return NextResponse.json({ message: 'Not authorized' }, { status: 403 });
    }

    const deposits = await prisma.transaction.findMany({
        where: { type: 'CREDIT', status: 'PENDING' },
        include: {
            user: { select: { id: true, name: true, email: true, phone: true } },
        },
        orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ deposits });
}