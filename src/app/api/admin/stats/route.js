import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

const istKey = (d) =>
    new Date(new Date(d).getTime() + 330 * 60000).toISOString().slice(0, 10);

const bucket = () => ({
    pendingCount: 0,
    pendingAmount: 0,
    completedCount: 0,
    completedAmount: 0,
});

// CREDIT = deposit, DEBIT = withdrawal, PENDING = waiting, SUCCESS = completed
export async function GET() {
    const admin = await getCurrentUser();
    if (!admin || admin.role !== "ADMIN") {
        return NextResponse.json({ message: "Not authorized" }, { status: 403 });
    }

    try {
        const [grouped, roles] = await Promise.all([
            prisma.transaction.groupBy({
                by: ["type", "status"],
                where: { status: { in: ["PENDING", "SUCCESS"] } },
                _sum: { amount: true },
                _count: { _all: true },
            }),
            prisma.user.groupBy({ by: ["role"], _count: { _all: true } }),
        ]);

        const deposits = bucket();
        const withdrawals = bucket();
        for (const g of grouped) {
            const b = g.type === "CREDIT" ? deposits : withdrawals;
            const amount = Number(g._sum.amount || 0);
            if (g.status === "PENDING") {
                b.pendingCount = g._count._all;
                b.pendingAmount = amount;
            } else {
                b.completedCount = g._count._all;
                b.completedAmount = amount;
            }
        }

        const roleCount = (r) => roles.find((x) => x.role === r)?._count._all ?? 0;

        // last 7 days (IST), completed only
        const days = [];
        for (let i = 6; i >= 0; i--) days.push(istKey(Date.now() - i * 86400000));

        const rows = await prisma.transaction.findMany({
            where: {
                status: "SUCCESS",
                transactionDate: { gte: new Date(Date.now() - 8 * 86400000) },
            },
            select: { type: true, amount: true, transactionDate: true },
        });

        const map = Object.fromEntries(
            days.map((d) => [d, { date: d, deposits: 0, withdrawals: 0 }]),
        );
        for (const r of rows) {
            const k = istKey(r.transactionDate);
            if (!map[k]) continue;
            map[k][r.type === "CREDIT" ? "deposits" : "withdrawals"] += Number(r.amount);
        }

        return NextResponse.json({
            deposits,
            withdrawals,
            users: { userCount: roleCount("USER"), adminCount: roleCount("ADMIN") },
            trend: days.map((d) => map[d]),
        });
    } catch (e) {
        console.error("[admin/stats]", e);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}