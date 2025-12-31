
import prisma from "@/lib/prisma";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Card } from "@/components/ui/Card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/Table";

export const dynamic = 'force-dynamic';

export default async function BalanceSheetPage() {
    await getServerSession(authOptions);

    // Fetch all GL Accounts with positive balance
    // @ts-ignore
    const glAccountsRaw = await prisma.gLAccount.findMany({
        orderBy: { code: 'asc' }
    });

    // Group by Type
    const groups: Record<string, any[]> = {
        asset: [],
        liability: [],
        equity: [],
        income: [],
        expense: []
    };

    const totals: Record<string, number> = {
        asset: 0,
        liability: 0,
        equity: 0,
        income: 0,
        expense: 0
    };

    glAccountsRaw.forEach((acc: any) => {
        const type = acc.type as string; // enum to string
        const balance = Number(acc.balance);
        if (groups[type]) {
            groups[type].push({ ...acc, balance });
            totals[type] += balance;
        }
    });

    // Calculate Net Equity (Assets - Liabilities) - Simplification
    // In real accounting, Equity = Assets - Liabilities.
    // Income/Expense are temporary equity accounts.
    // We will show Income - Expense as "Net Income".

    // Total Assets
    const totalAssets = totals.asset;
    // Total Liabilities
    const totalLiabilities = totals.liability;
    // Net Position
    const netPosition = totalAssets - totalLiabilities;
    // Net Income (P&L)
    const netIncome = totals.income - totals.expense;


    return (
        <div className="space-y-8 max-w-6xl mx-auto animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
                <div>
                    <Link href="/reports" className="group flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 mb-2">
                        <span className="mr-1 group-hover:-translate-x-1 transition-transform">&larr;</span> Back to Reports
                    </Link>
                    <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Balance Sheet</h1>
                    <p className="text-sm text-slate-500 mt-1">General Ledger Statement</p>
                </div>
                <Card className="px-6 py-3 bg-white shadow-sm border-slate-200 flex flex-col items-end">
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Net Position</div>
                    <div className={`text-2xl font-mono font-bold ${netPosition >= 0 ? 'text-slate-900' : 'text-red-600'}`}>
                        {netPosition.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">

                {/* ASSETS */}
                <Card>
                    <div className="px-6 py-4 border-b border-emerald-100 bg-emerald-50/50 flex justify-between items-center">
                        <h2 className="text-sm font-bold text-emerald-900 uppercase tracking-wider">Assets</h2>
                        <span className="font-mono font-bold text-emerald-900 text-lg">
                            {totals.asset.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                        </span>
                    </div>
                    <div className="relative w-full overflow-auto">
                        <Table>
                            <TableBody>
                                {groups.asset.map((acc) => (
                                    <TableRow key={acc.id} className="hover:bg-slate-50">
                                        <TableCell className="font-medium text-slate-700">
                                            <span className="text-slate-400 font-mono text-xs mr-3">{acc.code}</span>
                                            {acc.name}
                                        </TableCell>
                                        <TableCell className="text-right font-mono font-medium text-slate-900">
                                            {acc.balance.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {groups.asset.length === 0 && (
                                    <TableRow><TableCell colSpan={2} className="h-24 text-center text-slate-500 italic">No assets recorded</TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </Card>

                {/* LIABILITIES */}
                <Card>
                    <div className="px-6 py-4 border-b border-red-100 bg-red-50/50 flex justify-between items-center">
                        <h2 className="text-sm font-bold text-red-900 uppercase tracking-wider">Liabilities</h2>
                        <span className="font-mono font-bold text-red-900 text-lg">
                            {totals.liability.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                        </span>
                    </div>
                    <div className="relative w-full overflow-auto">
                        <Table>
                            <TableBody>
                                {groups.liability.map((acc) => (
                                    <TableRow key={acc.id} className="hover:bg-slate-50">
                                        <TableCell className="font-medium text-slate-700">
                                            <span className="text-slate-400 font-mono text-xs mr-3">{acc.code}</span>
                                            {acc.name}
                                        </TableCell>
                                        <TableCell className="text-right font-mono font-medium text-slate-900">
                                            {acc.balance.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {groups.liability.length === 0 && (
                                    <TableRow><TableCell colSpan={2} className="h-24 text-center text-slate-500 italic">No liabilities recorded</TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </Card>
            </div>

            {/* P&L SUMMARY */}
            <Card className="max-w-2xl">
                <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
                    <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Income Statement (YTD) Summary</h2>
                    <span className={`font-mono font-bold ${netIncome >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {netIncome.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                    </span>
                </div>
                <div className="relative w-full overflow-auto">
                    <Table>
                        <TableBody>
                            <TableRow className="bg-emerald-50/30 hover:bg-emerald-50/50">
                                <TableCell className="font-medium text-slate-900">Total Income</TableCell>
                                <TableCell className="text-right font-mono font-bold text-emerald-700">
                                    {totals.income.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                                </TableCell>
                            </TableRow>
                            {groups.income.map((acc) => (
                                <TableRow key={acc.id} className="hover:bg-slate-50">
                                    <TableCell className="text-xs text-slate-500 pl-8">
                                        {acc.code} - {acc.name}
                                    </TableCell>
                                    <TableCell className="text-right font-mono text-xs text-slate-500">
                                        {acc.balance.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                                    </TableCell>
                                </TableRow>
                            ))}
                            <TableRow className="bg-red-50/30 hover:bg-red-50/50 border-t border-slate-100">
                                <TableCell className="font-medium text-slate-900">Total Expenses</TableCell>
                                <TableCell className="text-right font-mono font-bold text-red-700">
                                    {totals.expense.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>
            </Card>
        </div>
    );
}
