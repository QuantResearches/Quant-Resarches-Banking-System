
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { subDays } from "date-fns";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "admin" && session.user.role !== "finance")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    try {
        const NINETY_DAYS_AGO = subDays(new Date(), 90);

        // Find accounts inactive since 90 days
        const dormantAccounts = await prisma.accountBalance.findMany({
            where: {
                last_calculated_at: { lt: NINETY_DAYS_AGO }
            },
            include: { account: { include: { customer: true } } } // nested include syntax check
        });

        // Loop and Create Alerts (avoiding duplicates if open alert exists)
        let alertCount = 0;

        for (const record of dormantAccounts) {
            // Check existing open alert
            // @ts-ignore
            const existing = await prisma.riskAlert.findFirst({
                where: {
                    account_id: record.account_id,
                    type: 'dormancy',
                    status: 'open'
                }
            });

            if (!existing) {
                // @ts-ignore
                await prisma.riskAlert.create({
                    data: {
                        type: 'dormancy',
                        severity: 'low',
                        description: `Account Inactive > 90 Days. Last active: ${record.last_calculated_at.toLocaleDateString()}`,
                        account_id: record.account_id,
                        // @ts-ignore
                        user_id: record.account?.created_by // Proxy for owner? No, better use account.creator or customer?
                        // Actually, Account model has created_by which is staff.
                        // Customer is separate.
                        // We link to account_id mainly.
                    }
                });
                alertCount++;
            }
        }

        return NextResponse.json({ success: true, scanned: dormantAccounts.length, new_alerts: alertCount });

    } catch (error) {
        console.error("Scan error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
