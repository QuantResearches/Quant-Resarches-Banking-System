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
            // A. Find or Create Bank Capital Account (Source of Funds)
            // In a real system, this ID would be in env vars or config. Finding by name for MVP robustness.
            let capitalAccount = await tx.account.findFirst({
                where: { account_type: "internal", customer: { email: "admin@quant.com" } }, // Assuming admin owns system accounts
                include: { balance: true }
            });

            // Auto-seed Capital Account if missing (for first-run only) - Self-Healing
            if (!capitalAccount) {
                // Try to find the admin customer first
                let adminCustomer = await tx.customer.findFirst({ where: { email: "admin@quant.com" } });
                // If no admin customer (unlikely if logged in, but possible in seed data), use the first available or create dummy
                if (!adminCustomer) {
                    adminCustomer = await tx.customer.create({
                        data: { email: "admin@quant.com", full_name: "System Administrator", phone: "0000000000", address: "HQ", created_by: session.user.id }
                    });
                }

                capitalAccount = await tx.account.create({
                    data: {
                        customer_id: adminCustomer.id,
                        account_type: "internal",
                        created_by: session.user.id,
                        balance: { create: { balance: 10000000 } } // Seed with 1 Crore Capital
                    },
                    include: { balance: true }
                });
            }

            const principal = Number(loan.approved_amount);

            // B. Solvency Check
            if (!capitalAccount.balance || Number(capitalAccount.balance.balance) < principal) {
                throw new Error(`Bank Capital Insufficient. Available: ${capitalAccount.balance?.balance}, Required: ${principal}`);
            }

            // C. Update Loan Status
            const loanUpdate = await tx.loan.update({
                where: { id },
                data: {
                    status: "ACTIVE",
                    disbursed_at: new Date()
                }
            });

            // D. Generate Repayment Schedule
            const rate = Number(loanUpdate.interest_rate) / 100;
            const tenure = loanUpdate.tenure_months;
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

            // E. Double-Entry Bookkeeping

            // Debit: Bank Capital (Money leaves bank)
            await tx.transaction.create({
                data: {
                    account_id: capitalAccount.id,
                    txn_type: "debit",
                    amount: principal,
                    reference: `LOAN-DISB-${loan.id.slice(0, 8)}`,
                    description: `Disbursement: ${loan.product.name} to ${loan.customer.full_name}`,
                    status: "POSTED",
                    channel: "SYSTEM",
                    created_by: session.user.id
                }
            });

            await tx.accountBalance.update({
                where: { account_id: capitalAccount.id },
                data: { balance: { decrement: principal }, last_calculated_at: new Date() }
            });

            // Credit: Customer Wallet (Money enters customer wallet)
            await tx.transaction.create({
                data: {
                    account_id: depositAccount.id,
                    txn_type: "credit",
                    amount: principal,
                    reference: `LOAN-DISB-${loan.id.slice(0, 8)}`,
                    description: `Loan Disbursement Received`,
                    status: "POSTED",
                    channel: "SYSTEM",
                    created_by: session.user.id
                    // related_account_id removed as it does not exist in schema
                }
            });

            await tx.accountBalance.update({
                where: { account_id: depositAccount.id },
                data: { balance: { increment: principal }, last_calculated_at: new Date() }
            });

            // F. Audit Log
            await tx.auditLog.create({
                data: {
                    user_id: session.user.id,
                    action: "LOAN_DISBURSE",
                    entity_type: "LOAN",
                    entity_id: id,
                    details: `Disbursed ${principal} from Capital ${capitalAccount.id} to Wallet ${depositAccount.id}`,
                    ip_address: "127.0.0.1"
                }
            });

            return loanUpdate;
        });

        return NextResponse.json({ success: true, loan: result });

    } catch (error) {
        console.error("Loan Disbursement Error:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to disburse loan";
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
