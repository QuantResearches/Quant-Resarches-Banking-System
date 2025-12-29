import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    try {
        const oldUser = await prisma.user.findUnique({ where: { id } });
        if (!oldUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const updatedUser = await prisma.user.update({
            where: { id },
            data: {
                is_active: false,
            },
        });

        // Kill active sessions
        await prisma.session.deleteMany({
            where: { user_id: id }
        });

        // Audit Log
        await prisma.auditLog.create({
            data: {
                user_id: session.user.id,
                action: "DISABLE_USER",
                entity_type: "User",
                entity_id: id,
                old_value: { is_active: oldUser.is_active } as any,
                new_value: { is_active: false } as any,
                ip_address: req.headers.get("x-forwarded-for") || "unknown",
                user_agent: req.headers.get("user-agent"),
            },
        });

        return NextResponse.json({ message: "User disabled" });
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
