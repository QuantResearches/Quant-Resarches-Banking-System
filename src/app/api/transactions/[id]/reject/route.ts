import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "admin" && session.user.role !== "finance")) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        const txnId = params.id;

        // Rejection is simple update, no balance change
        await prisma.transaction.update({
            where: { id: txnId },
            data: {
                status: "rejected",
                rejection_reason: "Rejected by approver",
                approved_by: session.user.id,
                approved_at: new Date(),
            } as any // Silence IDE error
        });

        return NextResponse.json({ status: "success" });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
