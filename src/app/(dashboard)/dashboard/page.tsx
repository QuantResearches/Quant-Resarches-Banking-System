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
    return { customerCount, accountCount, transactionCount };
}

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);
    const stats = await getStats();

    return (
        <div className="animate-in fade-in duration-500">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">System Overview</h1>
                <span className="text-xs font-mono text-gray-400">v2.4.0-Enterprise</span>
            </div>

            <SystemHealth />

            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Operational Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-50 text-blue-600">
                            <Users className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Active Customers</p>
                            <p className="text-2xl font-bold text-gray-800">{stats.customerCount}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-50 text-green-600">
                            <CreditCard className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Active Accounts</p>
                            <p className="text-2xl font-bold text-gray-800">{stats.accountCount}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-50 text-indigo-600">
                            <Activity className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Transactions Today</p>
                            <p className="text-2xl font-bold text-gray-800">{stats.transactionCount}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                <div className="lg:col-span-2">
                    <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Transaction Volume</h2>
                    <DashboardCharts />
                </div>
                <div>
                    <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Quick Actions</h2>
                    <QuickActions />
                </div>
            </div>
        </div>
    );
}
