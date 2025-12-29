
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";
// @ts-ignore
import { LoanStatus } from "@prisma/client";

const applicationSchema = z.object({
    customer_id: z.string().uuid(),
    product_id: z.string().uuid(),
    amount: z.number().positive(),
    tenure_months: z.number().int().positive(),
});

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const body = await req.json();
        const { customer_id, product_id, amount, tenure_months } = applicationSchema.parse(body);

        // 1. Fetch Product Configuration
        // @ts-ignore
        const product = await prisma.loanProduct.findUnique({
            where: { id: product_id }
        });

        if (!product || !product.active) {
            return NextResponse.json({ error: "Loan Product not found or inactive" }, { status: 404 });
        }

        // 2. Validate Constraints
        const amountDec = Number(product.min_amount); // Parse decimal to number for comparison
        if (amount < Number(product.min_amount) || amount > Number(product.max_amount)) {
            return NextResponse.json({
                error: `Amount must be between ${Number(product.min_amount)} and ${Number(product.max_amount)}`
            }, { status: 400 });
        }

        if (tenure_months < product.min_tenure_months || tenure_months > product.max_tenure_months) {
            return NextResponse.json({
                error: `Tenure must be between ${product.min_tenure_months} and ${product.max_tenure_months} months`
            }, { status: 400 });
        }

        // 3. Create Loan Application
        // @ts-ignore
        const loan = await prisma.loan.create({
            data: {
                customer_id,
                product_id,
                applied_amount: amount,
                // We default interest_rate to the MIN rate of the product for the application.
                // Final rate is set during Approval.
                interest_rate: product.interest_rate_min,
                tenure_months,
                status: LoanStatus.APPLIED,
                applied_at: new Date()
            }
        });

        return NextResponse.json(loan, { status: 201 });

    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.issues }, { status: 400 });
        }
        console.error(error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
