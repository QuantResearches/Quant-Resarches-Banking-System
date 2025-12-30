import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(
    req: Request,
    { params }: { params: { id: string } }
) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "admin" && session.user.role !== "finance")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id } = params;

        // 1. Fetch Loan
        const loan = await prisma.loan.findUnique({ where: { id } });
        if (!loan) return NextResponse.json({ error: "Loan not found" }, { status: 404 });
        if (loan.status !== "APPLIED") return NextResponse.json({ error: "Loan is not in APPLIED status" }, { status: 400 });

        // 2. Transaction Update
        const updatedLoan = await prisma.loan.update({
            where: { id },
            data: {
                status: "APPROVED",
                approved_by: session.user.id,
                approved_at: new Date(),
                approved_amount: loan.applied_amount // Admin can modify this in a real scenario, assuming full amount for now
            }
        });

        // 3. Audit Log
        await prisma.auditLog.create({
            data: {
                user_id: session.user.id,
                action: "LOAN_APPROVE",
                entity_type: "LOAN",
                entity_id: id,
                details: `Approved loan application for amount ${updatedLoan.approved_amount}`,
                ip_address: "127.0.0.1"
            }
        });

        return NextResponse.json({ success: true, loan: updatedLoan });
    } catch (error) {
        console.error("Loan Approval Error:", error);
        return NextResponse.json({ error: "Failed to approve loan" }, { status: 500 });
    }
}
