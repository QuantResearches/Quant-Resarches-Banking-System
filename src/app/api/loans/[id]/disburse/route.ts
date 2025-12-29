
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
// @ts-ignore
import { LoanStatus, TransactionStatus, TransactionChannel, Prisma } from "@prisma/client";
import { checkIdempotency, saveIdempotency } from "@/lib/idempotency";

function calculatePMT(principal: number, rate: number, months: number): number {
    // Rate is annual %, convert to monthly decimal
    const r = rate / 12 / 100;
    const n = months;
    if (r === 0) return principal / n;
    return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "admin" && session.user.role !== "finance")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = params;

    const savedResponse = await checkIdempotency(req);
    if (savedResponse) return savedResponse;

    try {
        const result = await prisma.$transaction(async (tx) => {
            // ... logic ...
            // 1. Fetch Loan
            // @ts-ignore
            const loan = await tx.loan.findUnique({
                where: { id },
                include: { customer: { include: { accounts: true } } }
            });

            if (!loan) throw new Error("Loan not found");
            // @ts-ignore
            if (loan.status !== LoanStatus.APPROVED) throw new Error("Loan must be APPROVED to disburse");

            // 2. Identify Target Account (Just pick the first active one for now, or require account_id in body)
            // Ideally, we ask which account to disburse to. Defaulting to first 'internal' or 'wallet' for simplicity.
            const targetAccount = loan.customer.accounts[0];
            if (!targetAccount) throw new Error("Customer has no active accounts to receive funds");

            // 3. Create Transaction (Disbursement)
            const amount = new Prisma.Decimal(loan.approved_amount || loan.applied_amount);

            const txn = await tx.transaction.create({
                data: {
                    account_id: targetAccount.id,
                    txn_type: "credit", // Deposit Money
                    amount: amount,
                    // @ts-ignore
                    status: TransactionStatus.POSTED,
                    // @ts-ignore
                    channel: TransactionChannel.SYSTEM,
                    description: `Loan Disbursement: ${loan.id.slice(0, 8)}`,
                    reference: `LOAN-${loan.id.slice(0, 8)}`,
                    created_by: session.user.id,
                    effective_date: new Date()
                } as any
            });

            // 4. Update Balance (Manual update since we are inside raw transaction if needed, but our Trigger logic is separate? 
            // Wait, previous transaction logic updated balance manually. We should replicate that or reuse a service.)
            // Replicating Balance Update Logic:
            const currentBalanceObj = await tx.accountBalance.findUnique({ where: { account_id: targetAccount.id } });
            const currentBalance = currentBalanceObj?.balance || new Prisma.Decimal(0);
            const newBalance = currentBalance.plus(amount);

            await tx.accountBalance.upsert({
                where: { account_id: targetAccount.id },
                create: { account_id: targetAccount.id, balance: newBalance },
                update: { balance: newBalance }
            });

            // 5. Generate Amortization Schedule
            // Standard Reducing Balance Method
            const principal = Number(amount);
            const rate = Number(loan.interest_rate);
            const tenure = loan.tenure_months;
            const emi = calculatePMT(principal, rate, tenure);

            let outstandingOwner = principal;
            const schedule = [];
            let currentDate = new Date();

            for (let i = 1; i <= tenure; i++) {
                // Next Month
                currentDate.setMonth(currentDate.getMonth() + 1);

                const interestComp = outstandingOwner * (rate / 12 / 100);
                const principalComp = emi - interestComp;

                outstandingOwner -= principalComp;

                schedule.push({
                    loan_id: loan.id,
                    due_date: new Date(currentDate),
                    amount_due: new Prisma.Decimal(emi),
                    principal_component: new Prisma.Decimal(principalComp),
                    interest_component: new Prisma.Decimal(interestComp),
                    status: "PENDING"
                });
            }

            // @ts-ignore
            await tx.loanRepayment.createMany({ data: schedule });

            // 6. Update Loan Status
            // @ts-ignore
            const updatedLoan = await tx.loan.update({
                where: { id },
                data: {
                    // @ts-ignore
                    status: LoanStatus.ACTIVE,
                    disbursed_at: new Date(),
                    // Update Approved Amount if it was different? Assuming it matches applied for now.
                    approved_amount: amount
                }
            });

            return updatedLoan;
        });

        await saveIdempotency(req, result, 200);
        return NextResponse.json(result);

    } catch (error: any) {
        await saveIdempotency(req, { error: error.message }, 500);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
