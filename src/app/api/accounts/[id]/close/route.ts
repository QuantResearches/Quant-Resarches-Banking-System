import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (session.user.role !== "admin" && session.user.role !== "finance") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    try {
        const account = await prisma.account.findUnique({ where: { id } });
        if (!account) return NextResponse.json({ error: "Not found" }, { status: 404 });

        const updated = await prisma.account.update({
            where: { id },
            data: { status: "closed" }
        });

        await prisma.auditLog.create({
            data: {
                user_id: session.user.id,
                action: "CLOSE_ACCOUNT",
                entity_type: "Account",
                entity_id: id,
                old_value: { status: account.status } as any,
                new_value: { status: "closed" } as any,
                ip_address: req.headers.get("x-forwarded-for") || "unknown",
                user_agent: req.headers.get("user-agent"),
            },
        });

        return NextResponse.json(updated);
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
