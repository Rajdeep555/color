import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth/session';

/**
 * app/api/wallet/deposit/route.js
 * POST /api/wallet/deposit
 * Called after the user submits their UTR on the deposit/pay page.
 * Creates a PENDING transaction — balance is NOT credited yet, that
 * only happens once an admin confirms it via /api/admin/deposits/[id]/confirm.
 */
export async function POST(request) {
    const user = await getCurrentUser();
    if (!user) {
        return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const { amount, account, utr, transactionRef } = body;

    if (!amount || !utr) {
        return NextResponse.json({ message: 'Amount and UTR are required.' }, { status: 400 });
    }

    const transaction = await prisma.$transaction(async (tx) => {
        const txn = await tx.transaction.create({
            data: {
                type: 'CREDIT',
                amount,
                status: 'PENDING',
                paymentMethod: 'UPI',
                userId: user.id,
                performedById: user.id,
                referenceId: utr,
                transactionNumber: transactionRef,
                description: `Deposit via ${account}`,
                transactionDate: new Date(),
            },
        });

        await tx.transactionEvent.create({
            data: {
                transactionId: txn.id,
                eventType: 'PAYMENT_INITIATED',
                performedById: user.id,
                description: 'User submitted UTR for verification',
            },
        });

        return txn;
    });

    return NextResponse.json({ transaction });
}