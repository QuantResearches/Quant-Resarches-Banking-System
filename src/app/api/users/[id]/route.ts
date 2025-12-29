import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const userUpdateSchema = z.object({
    role: z.enum(["admin", "finance", "viewer"]).optional(),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    try {
        const body = await req.json();
        const { role } = userUpdateSchema.parse(body);

        const oldUser = await prisma.user.findUnique({ where: { id } });
        if (!oldUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const updatedUser = await prisma.user.update({
            where: { id },
            data: {
                role,
            },
            select: {
                id: true,
                email: true,
                role: true,
                is_active: true,
            }
        });

        // Audit Log
        await prisma.auditLog.create({
            data: {
                user_id: session.user.id,
                action: "UPDATE_USER",
                entity_type: "User",
                entity_id: id,
                old_value: { role: oldUser.role } as any,
                new_value: { role: updatedUser.role } as any,
                ip_address: req.headers.get("x-forwarded-for") || "unknown",
                user_agent: req.headers.get("user-agent"),
            },
        });

        return NextResponse.json(updatedUser);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.errors }, { status: 400 });
        }
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
