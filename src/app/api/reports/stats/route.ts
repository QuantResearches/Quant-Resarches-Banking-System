import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        // 1. Transaction Counts by Day (Last 7 Days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const dailyTxns = await prisma.transaction.groupBy({
            by: ['created_at'],
            _count: { id: true },
            where: { created_at: { gte: sevenDaysAgo } },
        });

        // Normalize dates for chart
        const chartData = dailyTxns.reduce((acc, curr) => {
            const date = new Date(curr.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            acc[date] = (acc[date] || 0) + curr._count.id;
            return acc;
        }, {} as Record<string, number>);

        const lineChartData = Object.entries(chartData).map(([date, count]) => ({ date, count }));

        // 2. Monthly Inflow vs Outflow
        const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        const monthlyVolume = await prisma.transaction.groupBy({
            by: ['txn_type'],
            _sum: { amount: true },
            where: { created_at: { gte: firstDayOfMonth } }
        });

        const barChartData = [
            { name: 'Inflow (Credit)', value: Number(monthlyVolume.find(v => v.txn_type === 'credit')?._sum.amount || 0) },
            { name: 'Outflow (Debit)', value: Number(monthlyVolume.find(v => v.txn_type === 'debit')?._sum.amount || 0) },
        ];

        // 3. Active Accounts Count
        const activeAccounts = await prisma.account.count({ where: { status: 'active' } });

        return NextResponse.json({
            lineChartData,
            barChartData,
            activeAccounts
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
