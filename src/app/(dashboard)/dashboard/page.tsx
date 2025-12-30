import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { Users, CreditCard, Activity, Calendar } from "lucide-react";
import DashboardCharts from "@/components/charts/DashboardCharts";
import SystemHealth from "@/components/dashboard/SystemHealth";
import QuickActions from "@/components/dashboard/QuickActions";

export const dynamic = 'force-dynamic';

async function getStats() {
    // 1. Core Metrics
    const [customerCount, accountCount, transactionCount] = await Promise.all([
        prisma.customer.count({ where: { status: "active" } }),
        prisma.account.count({ where: { status: "active" } }),
        prisma.transaction.count({
            where: {
                created_at: {
                    gte: new Date(new Date().setHours(0, 0, 0, 0)),
                },
            },
        }),
    ]);

    // 2. Health & Risk Metrics
    const [riskAlerts, kycPending, loansPending, lastReconciliation, failedLogins24h] = await Promise.all([
        prisma.riskAlert.count({ where: { status: "open" } }),
        prisma.customerProfile.count({ where: { kyc_status: "PENDING_VERIFICATION" } }),
        prisma.loan.count({ where: { status: "APPLIED" } }),
        prisma.reconciliation.findFirst({ orderBy: { matched_at: 'desc' }, select: { matched_at: true } }),
        prisma.failedLoginAttempt.count({ where: { attempted_at: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } } })
    ]);

    const pendingCount = riskAlerts + kycPending + loansPending;

    // Determine Security Status
    // If more than 10 failed logins in 24h, we flag potential brute force or attack
    const securityStatus: "secure" | "at_risk" | "breached" = failedLogins24h > 10 ? "at_risk" : "secure";

    return {
        customerCount,
        accountCount,
        transactionCount,
        healthStats: {
            uptime_percentage: 100, // Hardcoded for now, or could measure against "server_start_time" in memory if we had it
            security_status: securityStatus,
            mfa_enabled_count: 0, // Placeholder
            last_reconciled: lastReconciliation?.matched_at || null,
            pending_actions: pendingCount,
            pending_breakdown: {
                kyc: kycPending,
                loans: loansPending,
                risk: riskAlerts
            }
        }
    };
}

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);
    const stats = await getStats();

    return (
        <div className="animate-in fade-in duration-500 space-y-8">
            {/* Standard Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-6">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">System Overview</h1>
                    <p className="text-sm text-slate-500 mt-1">Operational metrics and system health monitoring.</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-mono">
                        {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                </div>
            </div>

            {/* System Health Section */}
            <section>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">System Status</h2>
                </div>
                <SystemHealth stats={stats.healthStats} />
            </section>

            {/* Metrics Grid */}
            <section>
                <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Key Performance Indicators</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-white p-6 border border-slate-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-500">Total Customers</p>
                                <p className="text-3xl font-bold text-slate-900 mt-2">{stats.customerCount}</p>
                            </div>
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-full">
                                <Users className="w-6 h-6" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center text-xs text-green-600 font-medium">
                            <span>Active & Verified</span>
                        </div>
                    </div>

                    <div className="bg-white p-6 border border-slate-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-500">Retail Accounts</p>
                                <p className="text-3xl font-bold text-slate-900 mt-2">{stats.accountCount}</p>
                            </div>
                            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-full">
                                <CreditCard className="w-6 h-6" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center text-xs text-slate-400">
                            <span>Excluding Closed/Dormant</span>
                        </div>
                    </div>

                    <div className="bg-white p-6 border border-slate-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-500">Daily Transactions</p>
                                <p className="text-3xl font-bold text-slate-900 mt-2">{stats.transactionCount}</p>
                            </div>
                            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-full">
                                <Activity className="w-6 h-6" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center text-xs text-slate-400">
                            <span>Today's volume so far</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Split View: Charts & Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <section>
                        <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Transaction Volume Trend</h2>
                        <div className="bg-white p-6 border border-slate-200 rounded-lg shadow-sm">
                            <DashboardCharts />
                        </div>
                    </section>
                </div>

                <div className="space-y-6">
                    <section>
                        <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Quick Actions</h2>
                        <QuickActions />
                    </section>
                </div>
            </div>
        </div>
    );
}
