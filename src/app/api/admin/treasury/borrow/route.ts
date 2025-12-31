import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "admin" && session.user.role !== "finance")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { lender_name, amount, interest_rate, tenure_months, reference } = body;

        const principal = Number(amount);
        if (!principal || principal <= 0) {
            return NextResponse.json({ error: "Invalid principal amount" }, { status: 400 });
        }

        const result = await prisma.$transaction(async (tx) => {
            // 1. Create Liability Record
            const liability = await tx.bankLiability.create({
                data: {
                    lender_name,
                    principal_amount: principal,
                    interest_rate: Number(interest_rate),
                    tenure_months: Number(tenure_months),
                    reference_id: reference,
                    status: "ACTIVE",
                    created_by: session.user.id,
                    // Calculate maturity strictly for record
                    maturity_date: new Date(Date.now() + Number(tenure_months) * 30 * 24 * 60 * 60 * 1000)
                }
            });

            // 2. Find Bank Capital/Foundations Account to Credit the Cash
            // We reuse the same internal account used for Equity Injection
            let capitalAccount = await tx.account.findFirst({
                where: { account_type: "internal", customer: { email: "admin@quant.com" } }
            });

            // If not found, create it (Safety fallback, though InjectCapital should have handled it)
            if (!capitalAccount) {
                // ... (Simplified creation logic if missing, ideally reused from InjectCapital but inline here for safety)
                let adminCustomer = await tx.customer.findFirst({ where: { email: "admin@quant.com" } });
                if (!adminCustomer) {
                    adminCustomer = await tx.customer.create({
                        data: {
                            email: "admin@quant.com",
                            full_name: "System Administrator",
                            phone: "0000000000",
                            address: "HQ",
                            created_by: session.user.id
                        }
                    });
                }
                capitalAccount = await tx.account.create({
                    data: {
                        customer_id: adminCustomer.id,
                        account_type: "internal",
                        account_number: `10${Math.floor(100000000 + Math.random() * 900000000)}`,
                        created_by: session.user.id,
                        balance: { create: { balance: 0 } }
                    }
                });
            }

            // 3. Credit the Bank Account (Increase Cash)
            // Description distinguishes it from Equity
            await tx.transaction.create({
                data: {
                    account_id: capitalAccount.id,
                    txn_type: "credit",
                    amount: principal,
                    reference: reference || `DEBT-${liability.id.substring(0, 8)}`,
                    description: `Wholesale Borrowing: ${lender_name}`,
                    status: "POSTED",
                    channel: "SYSTEM",
                    created_by: session.user.id
                }
            });

            await tx.accountBalance.upsert({
                where: { account_id: capitalAccount.id },
                update: { balance: { increment: principal }, last_calculated_at: new Date() },
                create: { account_id: capitalAccount.id, balance: principal, last_calculated_at: new Date() }
            });

            // 4. Audit
            await tx.auditLog.create({
                data: {
                    user_id: session.user.id,
                    action: "BANK_BORROWING",
                    entity_type: "BANK_LIABILITY",
                    entity_id: liability.id,
                    details: `Borrowed ${principal} from ${lender_name} @ ${interest_rate}%`,
                    ip_address: "127.0.0.1"
                }
            });

            return liability;
        });

        return NextResponse.json(result);

    } catch (error) {
        console.error("Borrowing Error:", error);
        return NextResponse.json({ error: "Failed to record borrowing" }, { status: 500 });
    }
}
