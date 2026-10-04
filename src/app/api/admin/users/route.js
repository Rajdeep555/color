import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/requireAdmin";

export const dynamic = "force-dynamic";

export async function GET(req) {
    const { error } = await requireAdmin(req);
    if (error) return error;

    try {
        const users = await prisma.user.findMany({
            orderBy: { createdAt: "desc" },
            select: { id: true, name: true, phone: true, role: true, createdAt: true },
        });
        return NextResponse.json({ users });
    } catch (e) {
        console.error("[admin/users]", e);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}