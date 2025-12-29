import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Reporting logic can be complex. For now basic stats.
    try {
        const url = new URL(req.url);
        const type = url.searchParams.get("type");

        if (type === "daily-transactions") {
            const stats = await prisma.transaction.groupBy({
                by: ['txn_type'],
                _sum: { amount: true },
                _count: { id: true },
                where: {
                    created_at: {
                        gte: new Date(new Date().setHours(0, 0, 0, 0))
                    }
                }
            });
            return NextResponse.json(stats);
        } else if (type === "account-balances") {
            const balances = await prisma.accountBalance.findMany({
                include: { account: { select: { account_type: true } } },
                take: 100
            });
            return NextResponse.json(balances);
        }

        return NextResponse.json({ error: "Invalid report type" }, { status: 400 });
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
