import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "admin" && session.user.role !== "finance")) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        const txnId = params.id;

        await prisma.$transaction(async (tx) => {
            const txn = await tx.transaction.findUnique({
                where: { id: txnId },
                include: { account: { include: { balance: true } } }
            });

            if (!txn) throw new Error("Transaction not found");
            if ((txn as any).status !== "pending_approval") throw new Error("Transaction is not pending");

            // SECURITY: Maker-Checker Enforcement
            if (txn.created_by === session.user.id) {
                // @ts-ignore
                const { logSecurityEvent } = await import("@/lib/security-logger");
                await logSecurityEvent(
                    "SELF_APPROVAL_ATTEMPT",
                    "HIGH",
                    "User attempted to approve their own transaction",
                    session.user.id,
                    req as any,
                    { transaction_id: txnId }
                );
                throw new Error("Security Violation: You cannot approve a transaction you created.");
            }

            // Approve & Balance Update
            await tx.transaction.update({
                where: { id: txnId },
                data: {
                    status: "completed",
                    approved_by: session.user.id,
                    approved_at: new Date(),
                } as any // Silence IDE error
            });

            // Update Account Balance
            const currentBalance = txn.account.balance?.balance || 0;
            const decimalAmount = txn.amount;
            // @ts-ignore - Prisma Decimal types
            const balanceChange = txn.txn_type === "credit" ? decimalAmount : decimalAmount.negated();
            // @ts-ignore
            const newBalanceVal = currentBalance.plus(balanceChange);

            await tx.accountBalance.upsert({
                where: { account_id: txn.account_id },
                create: { account_id: txn.account_id, balance: newBalanceVal },
                update: { balance: newBalanceVal, last_calculated_at: new Date() }
            });

            // Post to General Ledger
            // @ts-ignore
            const vault = await tx.gLAccount.findUnique({ where: { code: "1000" } });
            // @ts-ignore
            const deposits = await tx.gLAccount.findUnique({ where: { code: "2000" } });

            if (vault && deposits) {
                const entries = [];
                // @ts-ignore
                if (txn.txn_type === "credit") {
                    entries.push({ gl_account_id: vault.id, amount: decimalAmount, type: "debit", transaction_id: txnId });
                    entries.push({ gl_account_id: deposits.id, amount: decimalAmount, type: "credit", transaction_id: txnId });

                    // @ts-ignore
                    await tx.gLAccount.update({ where: { id: vault.id }, data: { balance: { increment: decimalAmount } } });
                    // @ts-ignore
                    await tx.gLAccount.update({ where: { id: deposits.id }, data: { balance: { increment: decimalAmount } } });
                } else {
                    entries.push({ gl_account_id: deposits.id, amount: decimalAmount, type: "debit", transaction_id: txnId });
                    entries.push({ gl_account_id: vault.id, amount: decimalAmount, type: "credit", transaction_id: txnId });

                    // @ts-ignore
                    await tx.gLAccount.update({ where: { id: deposits.id }, data: { balance: { decrement: decimalAmount } } });
                    // @ts-ignore
                    await tx.gLAccount.update({ where: { id: vault.id }, data: { balance: { decrement: decimalAmount } } });
                }

                // @ts-ignore
                await tx.gLEntry.createMany({ data: entries as any });
            }
        });

        return NextResponse.json({ status: "success" });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
