import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth/jwt";

const COOKIE_NAMES = ["token", "auth-token", "authToken", "jwt", "access_token"];

export async function requireAdmin(req) {
    const header = req.headers.get("authorization");
    const token =
        (header?.startsWith("Bearer ") ? header.slice(7) : null) ||
        COOKIE_NAMES.map((n) => req.cookies.get(n)?.value).find(Boolean);

    if (!token) {
        return { error: NextResponse.json({ error: "No token" }, { status: 401 }) };
    }

    const payload = await verifyToken(token); // returns null when invalid
    if (!payload) {
        return { error: NextResponse.json({ error: "Invalid token" }, { status: 401 }) };
    }

    const id = payload.userId ?? payload.id ?? payload.sub;
    if (!id) {
        return { error: NextResponse.json({ error: "Token has no user id" }, { status: 401 }) };
    }

    const user = await prisma.user.findUnique({
        where: { id },
        select: { id: true, role: true, isActive: true },
    });

    if (!user || !user.isActive || user.role !== "ADMIN") {
        return { error: NextResponse.json({ error: "Admins only" }, { status: 403 }) };
    }
    return { user };
}