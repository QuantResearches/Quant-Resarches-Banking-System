import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // Disable MFA for user
        // We set mfa_secret to null to ensure a fresh setup next time
        await prisma.user.update({
            where: { id: session.user.id },
            data: {
                mfa_enabled: false,
                mfa_secret: null
            } as any
        });

        // Audit Log
        await prisma.auditLog.create({
            data: {
                user_id: session.user.id,
                action: "MFA_DISABLE",
                entity_type: "User",
                entity_id: session.user.id,
                ip_address: req.headers.get("x-forwarded-for") || "unknown"
            }
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("MFA Disable Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
