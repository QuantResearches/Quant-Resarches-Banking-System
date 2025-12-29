import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export default async function ReportsPage() {
    const session = await getServerSession(authOptions);

    // DAILY TRANSACTION VOLUME (Aggregated by Type)
    const dailyVolume = await prisma.transaction.groupBy({
        by: ['txn_type'],
        _sum: { amount: true },
        _count: { id: true },
        where: {
            created_at: {
                gte: new Date(new Date().setHours(0, 0, 0, 0))
            }
        }
    });

    // TOP 20 HIGH VALUE ACTIVE ACCOUNTS (Exclude Closed/Frozen & Zero Balance)
    const topAccounts = await prisma.accountBalance.findMany({
        take: 20,
        orderBy: { balance: 'desc' },
        where: {
            balance: { gt: 0 },
            account: { status: 'active' }
        },
        include: {
            account: {
                include: { customer: { select: { full_name: true, email: true } } }
            }
        }
    });

    // INACTIVE / SUSPENDED ACCOUNTS
    const inactiveAccounts = await prisma.account.findMany({
        where: { status: { in: ['frozen', 'closed'] } },
        include: {
            customer: { select: { full_name: true, email: true } },
            balance: true
        },
        orderBy: { created_at: 'desc' }
    });

    // STAFF ACTIVITY (Grouped by Creator) - Computed from raw fetch for today
    const todaysTransactions = await prisma.transaction.findMany({
        where: {
            created_at: {
                gte: new Date(new Date().setHours(0, 0, 0, 0))
            }
        },
        include: {
            creator: { select: { email: true, role: true } }
        }
    });

    // Aggregate by staff
    const staffStats: Record<string, { email: string; role: string; count: number; volume: number }> = {};

    todaysTransactions.forEach(txn => {
        const email = txn.creator.email;
        if (!staffStats[email]) {
            staffStats[email] = { email, role: txn.creator.role, count: 0, volume: 0 };
        }
        staffStats[email].count++;
        staffStats[email].volume += Number(txn.amount);
    });

    const staffList = Object.values(staffStats).sort((a, b) => b.volume - a.volume);

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-semibold">System Reports</h1>
                <div className="space-x-3">
                    <a href="/reports/general-ledger" className="bg-white border border-slate-300 text-slate-700 px-4 py-2 text-sm font-medium hover:bg-slate-50 transition-colors">
                        General Ledger
                    </a>
                    <a href="/reports/profit-loss" className="bg-white border border-slate-300 text-slate-700 px-4 py-2 text-sm font-medium hover:bg-slate-50 transition-colors">
                        Profit & Loss
                    </a>
                    <a href="/reports/balance-sheet" className="bg-slate-900 text-white px-4 py-2 text-sm font-medium hover:bg-slate-800 transition-colors">
                        Balance Sheet
                    </a>
                </div>
            </div>

            {/* Daily Volume Report */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white border border-gray-200 h-full">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                        <h2 className="text-sm font-semibold text-gray-700 uppercase">Transaction Volume (Type)</h2>
                    </div>
                    <table className="w-full text-sm text-left">
                        <thead className="text-gray-500 font-medium border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3">Type</th>
                                <th className="px-6 py-3 text-right">Count</th>
                                <th className="px-6 py-3 text-right">Volume</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 text-gray-600">
                            {dailyVolume.map((stat) => (
                                <tr key={stat.txn_type}>
                                    <td className="px-6 py-4 capitalize font-medium text-gray-900">{stat.txn_type}</td>
                                    <td className="px-6 py-4 text-right">{stat._count.id}</td>
                                    <td className={`px-6 py-4 text-right font-mono font-medium ${stat.txn_type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                                        {Number(stat._sum.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </td>
                                </tr>
                            ))}
                            {dailyVolume.length === 0 && (
                                <tr><td colSpan={3} className="px-6 py-8 text-center text-gray-500">No transactions today.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="bg-white border border-gray-200 h-full">
                    <div className="px-6 py-4 border-b border-gray-200 bg-blue-50">
                        <h2 className="text-sm font-semibold text-blue-800 uppercase">Staff Performance (Today)</h2>
                    </div>
                    <table className="w-full text-sm text-left">
                        <thead className="text-gray-500 font-medium border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3">Staff Member</th>
                                <th className="px-6 py-3 text-right">Actions</th>
                                <th className="px-6 py-3 text-right">Volume Processed</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 text-gray-600">
                            {staffList.map((staff) => (
                                <tr key={staff.email}>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900">{staff.email}</div>
                                        <div className="text-xs text-gray-500 capitalize">{staff.role}</div>
                                    </td>
                                    <td className="px-6 py-4 text-right">{staff.count}</td>
                                    <td className="px-6 py-4 text-right font-mono font-medium text-gray-900">
                                        {staff.volume.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </td>
                                </tr>
                            ))}
                            {staffList.length === 0 && (
                                <tr><td colSpan={3} className="px-6 py-8 text-center text-gray-500">No staff activity today.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Top Accounts Report - Active Only */}
            <div className="bg-white border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <h2 className="text-sm font-semibold text-gray-700 uppercase">Top 20 Active High Value Accounts</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-gray-500 font-medium border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3">Customer</th>
                                <th className="px-6 py-3">Account ID</th>
                                <th className="px-6 py-3">Type</th>
                                <th className="px-6 py-3 text-right">Balance</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 text-gray-600">
                            {topAccounts.map((balance) => (
                                <tr key={balance.account_id}>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900">{balance.account.customer.full_name}</div>
                                        <div className="text-xs text-gray-500">{balance.account.customer.email}</div>
                                    </td>
                                    <td className="px-6 py-4 font-mono text-xs">{balance.account_id.slice(0, 8)}...</td>
                                    <td className="px-6 py-4 capitalize">{balance.account.account_type}</td>
                                    <td className="px-6 py-4 text-right font-mono font-medium text-gray-900">
                                        {Number(balance.balance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </td>
                                </tr>
                            ))}
                            {topAccounts.length === 0 && (
                                <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">No active high-value accounts found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Inactive Accounts Registry */}
            <div className="bg-white border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200 bg-red-50">
                    <h2 className="text-sm font-semibold text-red-800 uppercase">Frozen & Closed Accounts Registry</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-gray-500 font-medium border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3">Customer</th>
                                <th className="px-6 py-3">Account ID</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3 text-right">Remaining Balance</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 text-gray-600">
                            {inactiveAccounts.map((account) => (
                                <tr key={account.id}>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900">{account.customer.full_name}</div>
                                    </td>
                                    <td className="px-6 py-4 font-mono text-xs">{account.id.slice(0, 8)}...</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-none ${account.status === "frozen" ? "bg-orange-100 text-orange-700" : "bg-red-100 text-red-700"}`}>
                                            {account.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right font-mono font-medium text-gray-900">
                                        {Number(account.balance?.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </td>
                                </tr>
                            ))}
                            {inactiveAccounts.length === 0 && (
                                <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">No inactive accounts found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
