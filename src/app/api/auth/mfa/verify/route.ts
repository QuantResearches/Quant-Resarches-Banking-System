
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { verifyMFAToken } from "@/lib/mfa";
import { logSecurityEvent } from "@/lib/security-logger";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const { token } = await req.json();

        // Fetch user secret
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            // @ts-ignore
            select: { mfa_secret: true }
        });

        if (!user || !(user as any).mfa_secret) {
            return NextResponse.json({ error: "MFA setup not initiated" }, { status: 400 });
        }

        const isValid = verifyMFAToken(token, (user as any).mfa_secret);

        if (!isValid) {
            await logSecurityEvent(
                "LOGIN_FAIL",
                "MEDIUM",
                "MFA Verification Failed during Setup",
                session.user.id,
                req
            );
            return NextResponse.json({ error: "Invalid Token" }, { status: 400 });
        }

        // Enable MFA
        await prisma.user.update({
            where: { id: session.user.id },
            data: { mfa_enabled: true } as any
        });

        await logSecurityEvent(
            "ADMIN_ACTION",
            "HIGH",
            "MFA Enabled Successfully",
            session.user.id,
            req
        );

        return NextResponse.json({ status: "success" });
    } catch (error) {
        console.error("MFA Verify Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
