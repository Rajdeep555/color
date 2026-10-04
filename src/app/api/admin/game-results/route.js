import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function GET(request) {
    const admin = await getCurrentUser();
    if (!admin || admin.role !== "ADMIN") {
        return NextResponse.json({ message: "Not authorized" }, { status: 403 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const limit = Math.min(
            Math.max(parseInt(searchParams.get("limit") || "1000", 10) || 1000, 1),
            5000,
        );

        const [bets, grouped] = await Promise.all([
            prisma.bet.findMany({
                where: { status: { in: ["WON", "LOST"] } },
                orderBy: { settledAt: "desc" },
                take: limit,
                include: { user: { select: { name: true, phone: true } } },
            }),
            prisma.bet.groupBy({
                by: ["status"],
                where: { status: { in: ["WON", "LOST"] } },
                _sum: { amount: true, payout: true },
                _count: { _all: true },
            }),
        ]);

        const results = bets.map((b) => ({
            id: b.id,
            period: b.period,
            result: b.status === "WON" ? "WIN" : "LOSS",
            betAmount: Number(b.amount),
            winAmount: Number(b.payout),
            createdAt: b.settledAt ?? b.createdAt,
            user: b.user,
        }));

        const won = grouped.find((g) => g.status === "WON");
        const lost = grouped.find((g) => g.status === "LOST");

        return NextResponse.json({
            results,
            totals: {
                totalWon: Number(won?._sum.payout || 0),
                totalLost: Number(lost?._sum.amount || 0),
                winCount: won?._count._all ?? 0,
                lossCount: lost?._count._all ?? 0,
            },
        });
    } catch (e) {
        console.error("[admin/game-results]", e);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}