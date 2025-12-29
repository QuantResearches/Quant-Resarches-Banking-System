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
        // Fetch last 50 transactions to reconstruct balance history
        // Note: Real ledger systems might store daily snapshots. Here we calculate on fly for simplicity.
        const transactions = await prisma.transaction.findMany({
            where: { account_id: id },
            orderBy: { created_at: 'asc' },
            select: { amount: true, txn_type: true, created_at: true }
        });

        let runningBalance = 0;
        const balanceHistory = transactions.map(txn => {
            if (txn.txn_type === 'credit') runningBalance += Number(txn.amount);
            else runningBalance -= Number(txn.amount);

            return {
                date: new Date(txn.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
                balance: runningBalance
            };
        });

        return NextResponse.json(balanceHistory);
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
