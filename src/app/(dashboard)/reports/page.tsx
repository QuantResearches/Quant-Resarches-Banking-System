import prisma from "@/lib/prisma";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Button } from "@/components/ui/Button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { Card } from "@/components/ui/Card";

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
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">System Reports</h1>
                    <p className="text-sm text-slate-500 mt-1">Financial statements and operational analytics.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Link href="/reports/general-ledger">
                        <Button variant="outline" className="bg-white hover:bg-slate-50">General Ledger</Button>
                    </Link>
                    <Link href="/reports/profit-loss">
                        <Button variant="outline" className="bg-white hover:bg-slate-50">Profit & Loss</Button>
                    </Link>
                    <Link href="/reports/balance-sheet">
                        <Button className="bg-slate-900 text-white hover:bg-slate-800 shadow-sm">Balance Sheet</Button>
                    </Link>
                </div>
            </div>

            {/* Daily Volume Report */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="h-full">
                    <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50">
                        <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Transaction Volume (Type)</h2>
                    </div>
                    <div className="relative w-full overflow-auto">
                        <Table>
                            <TableHeader className="bg-slate-50/50">
                                <TableRow>
                                    <TableHead className="font-semibold text-slate-900">Type</TableHead>
                                    <TableHead className="text-right font-semibold text-slate-900">Count</TableHead>
                                    <TableHead className="text-right font-semibold text-slate-900">Volume</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {dailyVolume.map((stat) => (
                                    <TableRow key={stat.txn_type}>
                                        <TableCell className="capitalize font-medium text-slate-900">{stat.txn_type}</TableCell>
                                        <TableCell className="text-right text-slate-600">{stat._count.id}</TableCell>
                                        <TableCell className={`text-right font-mono font-medium ${stat.txn_type === 'credit' ? 'text-emerald-600' : 'text-red-600'}`}>
                                            {Number(stat._sum.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {dailyVolume.length === 0 && (
                                    <TableRow><TableCell colSpan={3} className="h-24 text-center text-slate-500">No transactions today.</TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </Card>

                <Card className="h-full">
                    <div className="px-6 py-4 border-b border-blue-100 bg-blue-50/50">
                        <h2 className="text-sm font-semibold text-blue-900 uppercase tracking-wider">Staff Performance (Today)</h2>
                    </div>
                    <div className="relative w-full overflow-auto">
                        <Table>
                            <TableHeader className="bg-slate-50/50">
                                <TableRow>
                                    <TableHead className="font-semibold text-slate-900">Staff Member</TableHead>
                                    <TableHead className="text-right font-semibold text-slate-900">Actions</TableHead>
                                    <TableHead className="text-right font-semibold text-slate-900">Volume</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {staffList.map((staff) => (
                                    <TableRow key={staff.email}>
                                        <TableCell>
                                            <div className="font-medium text-slate-900">{staff.email}</div>
                                            <div className="text-xs text-slate-500 capitalize">{staff.role}</div>
                                        </TableCell>
                                        <TableCell className="text-right text-slate-600">{staff.count}</TableCell>
                                        <TableCell className="text-right font-mono font-medium text-slate-900">
                                            {staff.volume.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {staffList.length === 0 && (
                                    <TableRow><TableCell colSpan={3} className="h-24 text-center text-slate-500">No staff activity today.</TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </Card>
            </div>

            {/* Top Accounts Report - Active Only */}
            <Card>
                <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50">
                    <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Top 20 Active High Value Accounts</h2>
                </div>
                <div className="relative w-full overflow-auto">
                    <Table>
                        <TableHeader className="bg-slate-50/50">
                            <TableRow>
                                <TableHead className="font-semibold text-slate-900">Customer</TableHead>
                                <TableHead className="font-semibold text-slate-900">Account ID</TableHead>
                                <TableHead className="font-semibold text-slate-900">Type</TableHead>
                                <TableHead className="text-right font-semibold text-slate-900">Balance</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {topAccounts.map((balance) => (
                                <TableRow key={balance.account_id}>
                                    <TableCell>
                                        <div className="font-medium text-slate-900">{balance.account.customer.full_name}</div>
                                        <div className="text-xs text-slate-500">{balance.account.customer.email}</div>
                                    </TableCell>
                                    <TableCell className="font-mono text-xs text-slate-600">{balance.account_id.slice(0, 8)}...</TableCell>
                                    <TableCell className="capitalize text-slate-600">{balance.account.account_type}</TableCell>
                                    <TableCell className="text-right font-mono font-medium text-slate-900">
                                        {Number(balance.balance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {topAccounts.length === 0 && (
                                <TableRow><TableCell colSpan={4} className="h-24 text-center text-slate-500">No active high-value accounts found.</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </Card>

            {/* Inactive Accounts Registry */}
            <Card>
                <div className="px-6 py-4 border-b border-red-100 bg-red-50/50">
                    <h2 className="text-sm font-semibold text-red-900 uppercase tracking-wider">Frozen & Closed Accounts Registry</h2>
                </div>
                <div className="relative w-full overflow-auto">
                    <Table>
                        <TableHeader className="bg-slate-50/50">
                            <TableRow>
                                <TableHead className="font-semibold text-slate-900">Customer</TableHead>
                                <TableHead className="font-semibold text-slate-900">Account ID</TableHead>
                                <TableHead className="font-semibold text-slate-900">Status</TableHead>
                                <TableHead className="text-right font-semibold text-slate-900">Remaining Balance</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {inactiveAccounts.map((account) => (
                                <TableRow key={account.id}>
                                    <TableCell>
                                        <div className="font-medium text-slate-900">{account.customer.full_name}</div>
                                    </TableCell>
                                    <TableCell className="font-mono text-xs text-slate-600">{account.id.slice(0, 8)}...</TableCell>
                                    <TableCell>
                                        <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-md ${account.status === "frozen" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>
                                            {account.status}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right font-mono font-medium text-slate-900">
                                        {Number(account.balance?.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {inactiveAccounts.length === 0 && (
                                <TableRow><TableCell colSpan={4} className="h-24 text-center text-slate-500">No inactive accounts found.</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </Card>
        </div>
    );
}
