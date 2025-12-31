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
        const { amount, source, reference } = body;

        if (!amount || amount <= 0) {
            return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
        }

        const result = await prisma.$transaction(async (tx) => {
            // 1. Find or Create Bank Capital Account
            let capitalAccount = await tx.account.findFirst({
                where: { account_type: "internal", customer: { email: "admin@quant.com" } }
            });

            if (!capitalAccount) {
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
                        account_number: `10${Math.floor(100000000 + Math.random() * 900000000)}`, // 11 Digits (10 prefix for internal)
                        created_by: session.user.id,
                        balance: { create: { balance: 0 } } // Start 0, then inject
                    }
                });
            }

            // 2. Credit Capital (Equity Injection)
            // Transaction: Credit Bank Capital
            // Since this is Equity Intake, we only record the Credit side in our ledger if we don't have an External Bank representation.
            // Ideally: Dr External Settlement, Cr Bank Capital.
            // For MVP: Just Credit Bank Capital with Source description.

            const txn = await tx.transaction.create({
                data: {
                    account_id: capitalAccount.id,
                    txn_type: "credit",
                    amount: amount,
                    reference: reference || `CAP-INJ-${Date.now()}`,
                    description: `Capital Injection: ${source}`,
                    status: "POSTED",
                    channel: "SYSTEM",
                    created_by: session.user.id
                }
            });

            await tx.accountBalance.upsert({
                where: { account_id: capitalAccount.id },
                update: { balance: { increment: amount }, last_calculated_at: new Date() },
                create: { account_id: capitalAccount.id, balance: amount, last_calculated_at: new Date() }
            });

            // 3. Audit
            await tx.auditLog.create({
                data: {
                    user_id: session.user.id,
                    action: "CAPITAL_INJECTION",
                    entity_type: "ACCOUNT",
                    entity_id: capitalAccount.id,
                    details: `Injected ${amount} from ${source}`,
                    ip_address: "127.0.0.1"
                }
            });

            return txn;
        });

        return NextResponse.json(result);

    } catch (error) {
        console.error("Capital Injection Error:", error);
        return NextResponse.json({ error: "Failed to inject capital" }, { status: 500 });
    }
}
