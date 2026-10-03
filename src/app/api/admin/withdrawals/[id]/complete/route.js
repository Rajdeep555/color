import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth/session';

/**
 * app/api/admin/withdrawals/[id]/complete/route.js
 * No balance change here — the amount was already decremented when the
 * user submitted the request. This just flips status to SUCCESS.
 */
export async function POST(request, context) {
    const admin = await getCurrentUser();
    if (!admin || admin.role !== 'ADMIN') {
        return NextResponse.json({ message: 'Not authorized' }, { status: 403 });
    }

    const { id } = await context.params;

    const transaction = await prisma.transaction.findUnique({ where: { id } });
    if (!transaction || transaction.type !== 'DEBIT' || transaction.status !== 'PENDING') {
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

        await tx.transactionEvent.create({
            data: {
                transactionId: id,
                eventType: 'PAYMENT_COMPLETED',
                performedById: admin.id,
                description: 'Marked completed by admin',
            },
        });

        return updatedTxn;
    });

    return NextResponse.json({ transaction: updated });
}