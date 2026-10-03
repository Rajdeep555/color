import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth/session';

/**
 * app/api/user/bank-details/route.js
 * GET  — fetch the logged-in user's saved bank details (or null).
 * POST — create or update them (upsert, since it's one row per user).
 */
export async function GET() {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });

    const bankDetail = await prisma.bankDetail.findUnique({ where: { userId: user.id } });
    return NextResponse.json({ bankDetail });
}

export async function POST(request) {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });

    const body = await request.json();
    const { bankName, accountNumber, ifsc, holderName } = body;

    if (!bankName || !accountNumber || !ifsc || !holderName) {
        return NextResponse.json({ message: 'All fields are required.' }, { status: 400 });
    }

    const bankDetail = await prisma.bankDetail.upsert({
        where: { userId: user.id },
        update: { bankName, accountNumber, ifsc, holderName },
        create: { userId: user.id, bankName, accountNumber, ifsc, holderName },
    });

    return NextResponse.json({ bankDetail });
}