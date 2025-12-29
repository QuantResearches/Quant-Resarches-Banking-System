
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { generateMFASecret } from "@/lib/mfa";
import { logSecurityEvent } from "@/lib/security-logger";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (!session.user.email) return NextResponse.json({ error: "User email not found" }, { status: 400 });

    try {
        const { secret, qrCode } = await generateMFASecret(session.user.email);

        // Store secret temporarily (or permanently but disabled)
        // Here we overwrite. If they don't verify, it stays disabled but secret changes.
        // In prod, maybe use a temp table? For MVP, User table is fine.
        await prisma.user.update({
            where: { id: session.user.id },
            data: { mfa_secret: secret, mfa_enabled: false } as any
        });

        await logSecurityEvent(
            "ADMIN_ACTION",
            "MEDIUM",
            "MFA Setup Initiated",
            session.user.id,
            req
        );

        return NextResponse.json({ secret, qrCode });
    } catch (error) {
        console.error("MFA Setup Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
