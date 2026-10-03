import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth/session';

/**
 * app/api/wallet/withdraw/route.js
 * POST /api/wallet/withdraw
 * Reserves the funds immediately (decrements balance now, not on
 * approval) so the same balance can't be withdrawn twice via multiple
 * pending requests. Returns the new balance so the frontend can sync
 * without waiting on the next poll.
 */
export async function POST(request) {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });

    const body = await request.json();
    const { amount, fee, total, bankDetails } = body;

    if (!amount || !total) {
        return NextResponse.json({ message: 'Amount is required.' }, { status: 400 });
    }

    const freshUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { balance: true },
    });

    if (Number(freshUser.balance) < total) {
        return NextResponse.json({ message: 'Insufficient balance.' }, { status: 400 });
    }

    const { transaction, balance } = await prisma.$transaction(async (tx) => {
        const txn = await tx.transaction.create({
            data: {
                type: 'DEBIT',
                amount: total,
                status: 'PENDING',
                paymentMethod: 'OTHER',
                userId: user.id,
                performedById: user.id,
                description: `Withdrawal to ${bankDetails?.bankName || 'bank'} (fee ₹${fee})`,
                transactionDate: new Date(),
            },
        });

        const updatedUser = await tx.user.update({
            where: { id: user.id },
            data: { balance: { decrement: total } },
            select: { balance: true },
        });

        await tx.transactionEvent.create({
            data: {
                transactionId: txn.id,
                eventType: 'CREATED',
                performedById: user.id,
                description: 'Withdrawal requested',
            },
        });

        return { transaction: txn, balance: updatedUser.balance };
    });

    return NextResponse.json({ transaction, balance });
}