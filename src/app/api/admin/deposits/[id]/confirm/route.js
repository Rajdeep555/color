import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth/session';

/**
 * app/api/admin/deposits/[id]/confirm/route.js
 * POST /api/admin/deposits/:id/confirm
 * The ONLY place a deposit's amount actually reaches the user's balance —
 * marks the transaction SUCCESS and credits the user, atomically.
 */
export async function POST(request, context) {
    const admin = await getCurrentUser();
    if (!admin || admin.role !== 'ADMIN') {
        return NextResponse.json({ message: 'Not authorized' }, { status: 403 });
    }

    const { id } = await context.params;

    const transaction = await prisma.transaction.findUnique({ where: { id } });
    if (!transaction || transaction.type !== 'CREDIT' || transaction.status !== 'PENDING') {
        return NextResponse.json(
            { message: 'Transaction not found or already processed.' },
            { status: 400 }
        );
    }

    const updated = await prisma.$transaction(async (tx) => {
        const updatedTxn = await tx.transaction.update({
            where: { id },
            data: { status: 'SUCCESS' },
        });

        await tx.user.update({
            where: { id: transaction.userId },
            data: { balance: { increment: transaction.amount } },
        });

        await tx.transactionEvent.create({
            data: {
                transactionId: id,
                eventType: 'PAYMENT_COMPLETED',
                performedById: admin.id,
                description: 'Confirmed by admin',
            },
        });

        return updatedTxn;
    });

    return NextResponse.json({ transaction: updated });
}