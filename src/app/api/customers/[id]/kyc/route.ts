import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "admin" && session.user.role !== "finance")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    try {
        const body = await req.json();
        const { status } = body;

        if (!status || !["VERIFIED", "REJECTED"].includes(status)) {
            return NextResponse.json({ error: "Invalid status" }, { status: 400 });
        }

        const profile = await prisma.customerProfile.update({
            where: { customer_id: id }, // Note: We passed customerId in params
            data: {
                kyc_status: status,
                last_kyc_date: status === "VERIFIED" ? new Date() : undefined
            }
        });

        // Audit Log
        await prisma.auditLog.create({
            data: {
                user_id: session.user.id,
                action: "KYC_UPDATE",
                details: `Updated KYC status for customer ${id} to ${status}`,
                entity_type: "CUSTOMER_PROFILE",
                entity_id: id,
                ip_address: "127.0.0.1"
            }
        });

        return NextResponse.json({ success: true, profile });
    } catch (error) {
        console.error("KYC Update Error:", error);
        return NextResponse.json({ error: "Failed to update KYC status" }, { status: 500 });
    }
}
