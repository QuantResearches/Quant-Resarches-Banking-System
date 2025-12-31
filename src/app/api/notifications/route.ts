
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json([], { status: 401 });

    const role = session?.user?.role;
    const notifications = [];

    // 1. Pending Approvals (Admin/Finance only)
    if (role === 'admin' || role === 'finance') {
        // Count transactions with status 'PENDING'
        // Using "Transaction" model as per schema findings
        const pendingApprovals = await prisma.transaction.count({
            where: { status: 'PENDING' }
        });

        if (pendingApprovals > 0) {
            notifications.push({
                id: 'approval-1',
                title: 'Pending Approvals',
                message: `${pendingApprovals} transactions waiting for review`,
                type: 'warning',
                link: '/approvals',
                time: new Date()
            });
        }
    }

    // 2. High Risk Alerts (Admin only - since Compliance role doesn't exist yet)
    if (role === 'admin') {
        const highRiskAlerts = await prisma.riskAlert.findMany({
            where: {
                severity: 'high',
                status: 'open'
            },
            take: 3,
            orderBy: { created_at: 'desc' }
        });

        highRiskAlerts.forEach(alert => {
            notifications.push({
                id: `risk-${alert.id}`,
                title: 'High Risk Alert',
                message: alert.description,
                type: 'error',
                link: '/risk',
                time: alert.created_at
            });
        });
    }

    // 3. System Messages (Example: Recent logins or standard system alerts)
    // For now, let's keep it clean with real functional data only.

    return NextResponse.json(notifications);
}
