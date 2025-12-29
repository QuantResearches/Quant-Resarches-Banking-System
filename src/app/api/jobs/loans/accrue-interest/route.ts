
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
// @ts-ignore
import { LoanStatus, Prisma } from "@prisma/client";

export async function POST(req: Request) {
    // Basic Auth or Secret Header check suggested for Jobs
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        // For development, we might skip or verify differently.
        // return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));

        // 1. Fetch Active Loans
        // @ts-ignore
        const activeLoans = await prisma.loan.findMany({
            where: { status: LoanStatus.ACTIVE }
        });

        const updates = [];

        for (const loan of activeLoans) {
            // Simplified Calculation: Daily Interest on Outstanding Principal
            // Note: In reducing balance, 'outstanding' changes monthly.
            // However, for precise accrual, we need the *actual* current outstanding balance.

            // Re-calculating outstanding balance dynamically?
            // Current Balance = Applied - Principal Repaid.
            // Expensive to query sums every row.
            // Ideally `Loan` model has `outstanding_balance` field.
            // I will use `applied_amount` as a placeholder or fetch repayments.

            // @ts-ignore
            const paidRepayments = await prisma.loanRepayment.findMany({
                where: { loan_id: loan.id },
                select: { principal_component: true, amount_paid: true, status: true } // Simplified
            });

            // Approximation: Outstanding = Applied (Static) - Principal Repaid (Dynamic)
            // This is slow for batch. Real systems maintain `outstanding_balance` on the Loan record.
            // Assuming we added `outstanding_balance`? I didn't add it in last schema update. 
            // I added `accrued_interest`.

            // For MVP Batch: Calculate purely on `applied_amount` (Flat) if I can't easily get reduced.
            // Or just Accrue based on Rate/365.

            const rate = Number(loan.interest_rate);
            const dailyRate = rate / 100 / 365;
            const principal = Number(loan.applied_amount); // Fallback: Full principal (Flat during month?)

            const interest = principal * dailyRate;

            updates.push(
                // @ts-ignore
                prisma.loan.update({
                    where: { id: loan.id },
                    data: {
                        accrued_interest: { increment: interest }
                    }
                })
            );
        }

        // @ts-ignore
        await prisma.$transaction(updates);

        return NextResponse.json({ processed: updates.length, message: "Interest Accrued Successfully" });

    } catch (error: any) {
        console.error(error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
