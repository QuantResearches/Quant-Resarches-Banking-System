
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    try {
        const { id } = await params;

        // @ts-ignore
        await prisma.riskAlert.update({
            where: { id },
            data: {
                status: 'resolved',
                resolved_by: session.user.id,
                resolved_at: new Date()
            }
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Resolve error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
