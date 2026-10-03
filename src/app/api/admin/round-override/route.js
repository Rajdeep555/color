import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth/session';
import { clearOverrideCache } from '@/lib/game/overrideCache';

/**
 * app/api/admin/round-override/route.js
 * GET    — list all active overrides.
 * POST   — set/replace the override for a duration.
 * DELETE ?duration=30 — clear it, reverting that duration to the default.
 */
export async function GET() {
    const admin = await getSessionUser();
    if (!admin || admin.role !== 'ADMIN') {
        return NextResponse.json({ message: 'Not authorized' }, { status: 403 });
    }

    const overrides = await prisma.roundOverride.findMany({ orderBy: { roundDuration: 'asc' } });
    return NextResponse.json({ overrides });
}

export async function POST(request) {
    const admin = await getSessionUser();
    if (!admin || admin.role !== 'ADMIN') {
        return NextResponse.json({ message: 'Not authorized' }, { status: 403 });
    }

    const { roundDuration, overrideType, overrideValue } = await request.json();
    if (!roundDuration || !overrideType || overrideValue === undefined) {
        return NextResponse.json({ message: 'Missing fields.' }, { status: 400 });
    }

    const override = await prisma.roundOverride.upsert({
        where: { roundDuration },
        update: { overrideType, overrideValue: String(overrideValue), createdById: admin.id },
        create: { roundDuration, overrideType, overrideValue: String(overrideValue), createdById: admin.id },
    });

    clearOverrideCache(roundDuration);
    return NextResponse.json({ override });
}

export async function DELETE(request) {
    const admin = await getSessionUser();
    if (!admin || admin.role !== 'ADMIN') {
        return NextResponse.json({ message: 'Not authorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const roundDuration = Number(searchParams.get('duration'));

    await prisma.roundOverride.deleteMany({ where: { roundDuration } });
    clearOverrideCache(roundDuration);
    return NextResponse.json({ ok: true });
}