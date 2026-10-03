import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth/session';

export async function GET() {
    const admin = await getCurrentUser();
    if (!admin || admin.role !== 'ADMIN') {
        return NextResponse.json({ message: 'Not authorized' }, { status: 403 });
    }

    const withdrawals = await prisma.transaction.findMany({
        where: { type: 'DEBIT', status: 'PENDING' },
        include: { user: { select: { id: true, name: true, email: true, phone: true } } },
        orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ withdrawals });
}