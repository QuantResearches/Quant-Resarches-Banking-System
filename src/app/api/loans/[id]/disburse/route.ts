import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { addMonths } from "date-fns";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "admin" && session.user.role !== "finance")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id } = await params;

        // 1. Fetch Loan & Customer Account
        const loan = await prisma.loan.findUnique({
            where: { id },
            include: {
                product: true,
                customer: {
                    include: { accounts: { where: { account_type: "wallet", status: "active" } } }
                }
            }
        });

        if (!loan) return NextResponse.json({ error: "Loan not found" }, { status: 404 });
        if (loan.status !== "APPROVED") return NextResponse.json({ error: "Loan is not APPROVED. Cannot disburse." }, { status: 400 });

        const depositAccount = loan.customer.accounts[0];
        if (!depositAccount) return NextResponse.json({ error: "Customer has no active wallet to receive funds." }, { status: 400 });

        // 2. Execute Disbursement Transaction (Atomically)
        const result = await prisma.$transaction(async (tx) => {
            // A. Update Loan Status
            const activeLoan = await tx.loan.update({
                where: { id },
                data: {
                    status: "ACTIVE",
                    disbursed_at: new Date()
                }
            });

            // B. Generate Repayment Schedule (Simple Amortization / Flat for MVP)
            // Using Flat Interest for simplicity in MVP, or reading from product type
            const principal = Number(activeLoan.approved_amount);
            const rate = Number(activeLoan.interest_rate) / 100;
            const tenure = activeLoan.tenure_months;

            // Monthly Installment (Simplified: Principal/N + Interest on outstanding)
            // Let's use EMI formula for Reducing Balance if active, else standard.
            // MVP: Simple Principal + Interest Split equally

            const totalInterest = principal * rate * (tenure / 12);
            const totalAmount = principal + totalInterest;
            const emi = totalAmount / tenure;
            const monthlyPrincipal = principal / tenure;
            const monthlyInterest = totalInterest / tenure;

            for (let i = 1; i <= tenure; i++) {
                await tx.loanRepayment.create({
                    data: {
                        loan_id: id,
                        due_date: addMonths(new Date(), i),
                        amount_due: emi,
                        principal_component: monthlyPrincipal,
                        interest_component: monthlyInterest,
                        status: "PENDING"
                    }
                });
            }

            // C. Credit Customer Account
            // 1. Create Transaction Record
            const txn = await tx.transaction.create({
                data: {
                    account_id: depositAccount.id,
                    txn_type: "credit",
                    amount: principal,
                    reference: `LOAN-DISB-${loan.id.slice(0, 8)}`,
                    description: `Loan Disbursement: ${loan.product.name}`,
                    status: "POSTED",
                    channel: "SYSTEM",
                    created_by: session.user.id
                }
            });

            // 2. Update Balance
            await tx.accountBalance.upsert({
                where: { account_id: depositAccount.id },
                update: {
                    balance: { increment: principal },
                    last_calculated_at: new Date()
                },
                create: {
                    account_id: depositAccount.id,
                    balance: principal,
                    last_calculated_at: new Date()
                }
            });

            // D. Audit Log
            await tx.auditLog.create({
                data: {
                    user_id: session.user.id,
                    action: "LOAN_DISBURSE",
                    entity_type: "LOAN",
                    entity_id: id,
                    details: `Disbursed ${principal} to account ${depositAccount.id}`,
                    ip_address: "127.0.0.1"
                }
            });

            return activeLoan;
        });

        return NextResponse.json({ success: true, loan: result });

    } catch (error) {
        console.error("Loan Disbursement Error:", error);
        return NextResponse.json({ error: "Failed to disburse loan" }, { status: 500 });
    }
}
