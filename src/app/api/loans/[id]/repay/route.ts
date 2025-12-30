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
        const body = await req.json();
        const { amount } = body;

        if (!amount || amount <= 0) {
            return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
        }

        // 1. Fetch Loan & Customer Account
        const loan = await prisma.loan.findUnique({
            where: { id },
            include: {
                repayments: {
                    where: { status: { in: ["PENDING", "PARTIAL", "OVERDUE"] } },
                    orderBy: { due_date: "asc" }
                },
                customer: {
                    include: { accounts: { where: { account_type: "wallet", status: "active" } } }
                }
            }
        });

        if (!loan) return NextResponse.json({ error: "Loan not found" }, { status: 404 });
        const wallet = loan.customer.accounts[0];
        if (!wallet) return NextResponse.json({ error: "No active wallet to repay from" }, { status: 400 });

        // Check Balance
        const walletBalance = await prisma.accountBalance.findUnique({ where: { account_id: wallet.id } });
        if (!walletBalance || Number(walletBalance.balance) < amount) {
            return NextResponse.json({ error: "Insufficient wallet balance" }, { status: 400 });
        }

        // 2. Execute Repayment (Atomically)
        const result = await prisma.$transaction(async (tx) => {
            // A. Debit Wallet
            await tx.transaction.create({
                data: {
                    account_id: wallet.id,
                    txn_type: "debit",
                    amount: amount,
                    reference: `LOAN-REPAY-${id.slice(0, 8)}`,
                    description: `Repayment for Loan ${loan.product_id ? "" : ""}`,
                    status: "POSTED",
                    channel: "SYSTEM",
                    created_by: session.user.id
                }
            });

            await tx.accountBalance.update({
                where: { account_id: wallet.id },
                data: { balance: { decrement: amount } }
            });

            // B. Waterfall Logic (Distribute amount to repayments)
            let remaining = amount;

            for (const repayment of loan.repayments) {
                if (remaining <= 0) break;

                const due = Number(repayment.amount_due) - Number(repayment.amount_paid);
                const pay = Math.min(remaining, due);

                await tx.loanRepayment.update({
                    where: { id: repayment.id },
                    data: {
                        amount_paid: { increment: pay },
                        status: (Number(repayment.amount_paid) + pay) >= Number(repayment.amount_due) ? "PAID" : "PARTIAL",
                        paid_at: new Date()
                    }
                });

                remaining -= pay;
            }

            // C. Update Loan Status if fully paid? (Not implementing full closure logic yet for MVP, just payment)

            // D. Audit
            await tx.auditLog.create({
                data: {
                    user_id: session.user.id,
                    action: "LOAN_REPAYMENT",
                    entity_type: "LOAN",
                    entity_id: id,
                    details: `Repayment of ${amount} collected from wallet ${wallet.id}`,
                    ip_address: "127.0.0.1"
                }
            });

            return { success: true, remaining };
        });

        return NextResponse.json(result);

    } catch (error) {
        console.error("Loan Repayment Error:", error);
        return NextResponse.json({ error: "Failed to process repayment" }, { status: 500 });
    }
}
