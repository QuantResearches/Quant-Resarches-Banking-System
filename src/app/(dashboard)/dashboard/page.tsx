import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { Users, CreditCard, DollarSign, Activity, Calendar } from "lucide-react";
import DashboardCharts from "@/components/charts/DashboardCharts";

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
        <div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-8">Dashboard Overview</h1>
            <DashboardCharts />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 border border-gray-200">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-50 text-blue-600">
                            <Users className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Active Customers</p>
                            <p className="text-2xl font-bold">{stats.customerCount}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 border border-gray-200">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-50 text-green-600">
                            <CreditCard className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Active Accounts</p>
                            <p className="text-2xl font-bold">{stats.accountCount}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 border border-gray-200">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-50 text-indigo-600">
                            <Activity className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Transactions Today</p>
                            <p className="text-2xl font-bold">{stats.transactionCount}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 border border-gray-200 min-h-[300px] flex items-center justify-center text-gray-400">
                <div className="text-center">
                    <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Select a module from the sidebar to verify entries.</p>
                </div>
            </div>
        </div>
    );
}
