import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { verifyMFAToken } from "@/lib/mfa";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { code } = await req.json();

        if (!code || code.length !== 6) {
            return NextResponse.json({ error: "Invalid code format" }, { status: 400 });
        }

        // Fetch User's MFA Secret
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { mfa_secret: true, mfa_enabled: true }
        });

        if (!user || !user.mfa_secret) {
            return NextResponse.json({ error: "MFA setup not initiated" }, { status: 400 });
        }

        const isValid = verifyMFAToken(code, user.mfa_secret);

        if (!isValid) {
            return NextResponse.json({ error: "Invalid authenticator code" }, { status: 400 });
        }

        // CRITICAL FIX: Enable MFA for the user permanently
        await prisma.user.update({
            where: { id: session.user.id },
            data: { mfa_enabled: true } as any
        });

        // Update Session in DB
        // @ts-ignore
        const currentSessionId = session.user.sessionId; // We put this in token/session in auth.ts

        if (currentSessionId) {
            // @ts-ignore
            await prisma.session.update({
                where: { id: currentSessionId },
                data: {
                    is_mfa_verified: true
                } as any
            });

            // Log it
            await prisma.auditLog.create({
                data: {
                    user_id: session.user.id,
                    action: "MFA_VERIFY",
                    entity_type: "Session",
                    entity_id: currentSessionId,
                    ip_address: req.headers.get("x-forwarded-for") || "unknown"
                }
            });
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("MFA Verify Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
