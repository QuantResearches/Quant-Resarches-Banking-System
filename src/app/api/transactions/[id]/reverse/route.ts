import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
// @ts-ignore
import { Prisma, TransactionStatus, TransactionChannel } from "@prisma/client";

export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "admin" && session.user.role !== "finance")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = params;

    // 1. Get Original Transaction
    const originalTxn = await prisma.transaction.findUnique({
        where: { id },
        include: { account: true, reversal_of: true, reversed_by: true } as any
    });

    if (!originalTxn) {
        return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    // @ts-ignore
    if (originalTxn.status !== TransactionStatus.POSTED && originalTxn.status !== "completed") { // Handle legacy
        return NextResponse.json({ error: "Only POSTED transactions can be reversed" }, { status: 400 });
    }

    if (originalTxn.reversed_by) {
        return NextResponse.json({ error: "Transaction is already reversed" }, { status: 400 });
    }

    // 2. Create Reversal
    try {
        const result = await prisma.$transaction(async (tx) => {
            const reversalAmount = new Prisma.Decimal(originalTxn.amount);
            const reversalType = originalTxn.txn_type === 'credit' ? 'debit' : 'credit';

            // Create Reversal Record
            const reversalTxn = await tx.transaction.create({
                data: {
                    account_id: originalTxn.account_id,
                    txn_type: reversalType,
                    amount: reversalAmount,
                    // @ts-ignore
                    status: TransactionStatus.POSTED,
                    // @ts-ignore
                    channel: TransactionChannel.SYSTEM,
                    description: `Reversal of ${originalTxn.reference || id}`,
                    reference: `REV-${originalTxn.reference || id.slice(0, 8)}`,
                    reversal_of_id: originalTxn.id,
                    created_by: session.user.id,
                    effective_date: new Date()
                } as any
            });

            // Update Account Balance
            const currentBalanceObj = await tx.accountBalance.findUnique({ where: { account_id: originalTxn.account_id } });
            const currentBalance = currentBalanceObj?.balance || new Prisma.Decimal(0);

            // If Original was Credit (+), Reversal is Debit (-). Balance decreases.
            const balanceChange = reversalType === 'credit' ? reversalAmount : reversalAmount.negated();
            const newBalance = currentBalance.plus(balanceChange);

            await tx.accountBalance.upsert({
                where: { account_id: originalTxn.account_id },
                create: { account_id: originalTxn.account_id, balance: newBalance },
                update: { balance: newBalance }
            });

            // GL Entries (Contra)
            // Original Credit: Dr Vault, Cr Deposit
            // Reversal Debit : Dr Deposit, Cr Vault
            // We can reuse the main Posting Logic or copy it here.
            // For Safety/Speed, copy logic but swap types.
            // @ts-ignore
            const vault = await tx.gLAccount.findUnique({ where: { code: "1000" } });
            // @ts-ignore
            const deposits = await tx.gLAccount.findUnique({ where: { code: "2000" } });

            if (vault && deposits) {
                const entries = [];
                if (reversalType === "credit") { // Money coming back (e.g. reversing a withdrawal)
                    entries.push({ gl_account_id: vault.id, amount: reversalAmount, type: "debit", transaction_id: reversalTxn.id });
                    entries.push({ gl_account_id: deposits.id, amount: reversalAmount, type: "credit", transaction_id: reversalTxn.id });
                    // @ts-ignore
                    await tx.gLAccount.update({ where: { id: vault.id }, data: { balance: { increment: reversalAmount } } });
                    // @ts-ignore
                    await tx.gLAccount.update({ where: { id: deposits.id }, data: { balance: { increment: reversalAmount } } });
                } else { // Money leaving (reversing a deposit)
                    entries.push({ gl_account_id: deposits.id, amount: reversalAmount, type: "debit", transaction_id: reversalTxn.id });
                    entries.push({ gl_account_id: vault.id, amount: reversalAmount, type: "credit", transaction_id: reversalTxn.id });
                    // @ts-ignore
                    await tx.gLAccount.update({ where: { id: deposits.id }, data: { balance: { decrement: reversalAmount } } });
                    // @ts-ignore
                    await tx.gLAccount.update({ where: { id: vault.id }, data: { balance: { decrement: reversalAmount } } });
                }
                // @ts-ignore
                await tx.gLEntry.createMany({ data: entries as any });
            }

            return reversalTxn;
        });

        return NextResponse.json(result);

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
