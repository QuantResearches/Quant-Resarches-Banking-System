
import prisma from "@/lib/prisma";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Card } from "@/components/ui/Card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/Table";

export const dynamic = 'force-dynamic';

export default async function ProfitLossPage() {
    await getServerSession(authOptions);

    // Fetch Income and Expense Accounts
    // @ts-ignore
    const glAccountsRaw = await prisma.gLAccount.findMany({
        where: {
            type: { in: ['income', 'expense'] }
        },
        orderBy: { code: 'asc' }
    });

    const incomeAccounts: any[] = [];
    const expenseAccounts: any[] = [];
    let totalIncome = 0;
    let totalExpenses = 0;

    glAccountsRaw.forEach((acc: any) => {
        const balance = Number(acc.balance);
        if (acc.type === 'income') {
            incomeAccounts.push({ ...acc, balance });
            totalIncome += balance;
        } else if (acc.type === 'expense') {
            expenseAccounts.push({ ...acc, balance });
            totalExpenses += balance;
        }
    });

    const netIncome = totalIncome - totalExpenses;

    return (
        <div className="space-y-8 max-w-5xl mx-auto animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
                <div>
                    <Link href="/reports" className="group flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 mb-2">
                        <span className="mr-1 group-hover:-translate-x-1 transition-transform">&larr;</span> Back to Reports
                    </Link>
                    <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Profit & Loss Statement</h1>
                    <p className="text-sm text-slate-500 mt-1">Income Assessment (Year-to-Date)</p>
                </div>
                <Card className="px-6 py-3 bg-white shadow-sm border-slate-200 flex flex-col items-end">
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Net Income</div>
                    <div className={`text-2xl font-mono font-bold ${netIncome >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {netIncome.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                    </div>
                </Card>
            </div>

            {/* INCOME */}
            <Card>
                <div className="px-6 py-4 border-b border-emerald-100 bg-emerald-50/50 flex justify-between items-center">
                    <h2 className="text-sm font-bold text-emerald-900 uppercase tracking-wider">Revenue / Income</h2>
                    <span className="font-mono font-bold text-emerald-900 text-lg">
                        {totalIncome.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                    </span>
                </div>
                <div className="relative w-full overflow-auto">
                    <Table>
                        <TableBody>
                            {incomeAccounts.map((acc) => (
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
                            {incomeAccounts.length === 0 && (
                                <TableRow><TableCell colSpan={2} className="h-24 text-center text-slate-500 italic">No revenue recorded</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </Card>

            {/* EXPENSES */}
            <Card>
                <div className="px-6 py-4 border-b border-red-100 bg-red-50/50 flex justify-between items-center">
                    <h2 className="text-sm font-bold text-red-900 uppercase tracking-wider">Operating Expenses</h2>
                    <span className="font-mono font-bold text-red-900 text-lg">
                        {totalExpenses.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                    </span>
                </div>
                <div className="relative w-full overflow-auto">
                    <Table>
                        <TableBody>
                            {expenseAccounts.map((acc) => (
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
                            {expenseAccounts.length === 0 && (
                                <TableRow><TableCell colSpan={2} className="h-24 text-center text-slate-500 italic">No expenses recorded</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </Card>
        </div>
    );
}
