
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
// @ts-ignore
import { LoanStatus } from "@prisma/client";

export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "admin" && session.user.role !== "finance")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = params;

    try {
        // @ts-ignore
        const loan = await prisma.loan.findUnique({ where: { id } });

        if (!loan) {
            return NextResponse.json({ error: "Loan Application not found" }, { status: 404 });
        }

        // @ts-ignore
        if (loan.status !== LoanStatus.APPLIED) {
            return NextResponse.json({ error: "Only APPLIED loans can be approved" }, { status: 400 });
        }

        // @ts-ignore
        const updatedLoan = await prisma.loan.update({
            where: { id },
            data: {
                // @ts-ignore
                status: LoanStatus.APPROVED,
                approved_by: session.user.id,
                approved_at: new Date()
            }
        });

        return NextResponse.json(updatedLoan);

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
