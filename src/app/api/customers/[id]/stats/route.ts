import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    try {
        // Total stats across all accounts
        const accounts = await prisma.account.findMany({
            where: { customer_id: id },
            include: { transactions: true }
        });

        let totalCredit = 0;
        let totalDebit = 0;

        accounts.forEach(acc => {
            acc.transactions.forEach(txn => {
                const amt = Number(txn.amount);
                if (txn.txn_type === 'credit') totalCredit += amt;
                else totalDebit += amt;
            });
        });

        return NextResponse.json({
            totalCredit,
            totalDebit,
            netBalance: totalCredit - totalDebit
        });
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
