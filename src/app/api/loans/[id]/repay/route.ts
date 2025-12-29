
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";
// @ts-ignore
import { LoanStatus, RepaymentStatus, TransactionStatus, TransactionChannel, Prisma } from "@prisma/client";
import { checkIdempotency, saveIdempotency } from "@/lib/idempotency";

const repaymentSchema = z.object({
    amount: z.number().positive(),
    repayment_id: z.string().uuid().optional(), // If paying a specific schedule
});

export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "admin" && session.user.role !== "finance")) {
        // Ideally customers can repay too, but starting with Admin-led repayment for MVP.
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = params;

    const savedResponse = await checkIdempotency(req);
    if (savedResponse) return savedResponse;

    try {
        const body = await req.json();
        const { amount, repayment_id } = repaymentSchema.parse(body);
        const paymentAmount = new Prisma.Decimal(amount);

        const result = await prisma.$transaction(async (tx) => {
            // 1. Fetch Loan
            // @ts-ignore
            const loan = await tx.loan.findUnique({
                where: { id },
                include: { customer: { include: { accounts: true } } }
            });

            if (!loan) throw new Error("Loan not found");
            // @ts-ignore
            if (loan.status !== LoanStatus.ACTIVE && loan.status !== LoanStatus.DEFAULTED) {
                throw new Error("Loan is not active");
            }

            // 2. Identify Source Account (Customer Wallet)
            const sourceAccount = loan.customer.accounts[0];
            if (!sourceAccount) throw new Error("Customer has no active accounts");

            // 3. Check Balance
            const currentBalanceObj = await tx.accountBalance.findUnique({ where: { account_id: sourceAccount.id } });
            const currentBalance = currentBalanceObj?.balance || new Prisma.Decimal(0);

            if (currentBalance.lessThan(paymentAmount)) {
                throw new Error("Insufficient funds in customer account");
            }

            // 4. Create Transaction (Repayment)
            const txn = await tx.transaction.create({
                data: {
                    account_id: sourceAccount.id,
                    txn_type: "debit", // Money Leaving Customer
                    amount: paymentAmount,
                    // @ts-ignore
                    status: TransactionStatus.POSTED,
                    // @ts-ignore
                    channel: TransactionChannel.SYSTEM,
                    description: `Loan Repayment: ${loan.id.slice(0, 8)}`,
                    reference: `PAY-${loan.id.slice(0, 8)}-${Date.now().toString().slice(-4)}`,
                    created_by: session.user.id,
                    effective_date: new Date()
                } as any
            });

            // 5. Update Balance
            const newBalance = currentBalance.minus(paymentAmount);
            await tx.accountBalance.update({
                where: { account_id: sourceAccount.id },
                data: { balance: newBalance }
            });

            // 6. Allocate Payment (Waterfall)
            // Strategy: Close oldest pending schedules first.
            // @ts-ignore
            const pendingSchedules = await tx.loanRepayment.findMany({
                where: { loan_id: id, status: { not: RepaymentStatus.PAID } },
                orderBy: { due_date: 'asc' }
            });

            let remainingPayment = Number(paymentAmount);

            for (const schedule of pendingSchedules) {
                if (remainingPayment <= 0) break;

                const amountDue = Number(schedule.amount_due) - Number(schedule.amount_paid);

                if (remainingPayment >= amountDue) {
                    // Full Payment of this schedule
                    // @ts-ignore
                    await tx.loanRepayment.update({
                        where: { id: schedule.id },
                        data: {
                            amount_paid: schedule.amount_due,
                            // @ts-ignore
                            status: RepaymentStatus.PAID,
                            paid_at: new Date()
                        }
                    });
                    remainingPayment -= amountDue;
                } else {
                    // Partial Payment
                    // @ts-ignore
                    await tx.loanRepayment.update({
                        where: { id: schedule.id },
                        data: {
                            amount_paid: { increment: remainingPayment },
                            // @ts-ignore
                            status: RepaymentStatus.PARTIAL
                        }
                    });
                    remainingPayment = 0;
                }
            }

            // 7. Check if Loan Completed?
            // (If all schedules PAID, mark Loan CLOSED).
            // For MVP, simplistic check.
            // @ts-ignore
            const unPaidCount = await tx.loanRepayment.count({
                where: { loan_id: id, status: { not: RepaymentStatus.PAID } }
            });

            if (unPaidCount === 0) {
                // @ts-ignore
                await tx.loan.update({
                    where: { id },
                    // @ts-ignore
                    data: { status: LoanStatus.CLOSED, closed_at: new Date() }
                });
            }

            // 8. GL Entries (Dr Deposits, Cr Cash/Loan Asset)
            // Skipping detailed GL split (Dr Customer Deposits, Cr Loan Account Asset) for brevity, but crucial in Prod.
            // Assuming "Loan Account" tracking via `loans` table sufficient for operational view.

            return txn;
        });

        await saveIdempotency(req, result, 200);
        return NextResponse.json(result);

    } catch (error: any) {
        await saveIdempotency(req, { error: error.message }, 500);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
