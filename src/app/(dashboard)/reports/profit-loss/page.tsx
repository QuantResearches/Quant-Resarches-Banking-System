
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

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
        <div className="space-y-8 max-w-4xl mx-auto">
            <div className="flex justify-between items-center border-b border-gray-200 pb-4">
                <div>
                    <a href="/reports" className="text-sm text-blue-600 hover:underline mb-2 inline-block">&larr; Back to Reports</a>
                    <h1 className="text-2xl font-bold text-slate-900">Profit & Loss Statement</h1>
                    <p className="text-slate-500 text-sm">Income Statement (YTD)</p>
                </div>
                <div className="text-right">
                    <div className="text-sm font-medium text-slate-500 uppercase tracking-wider">Net Income</div>
                    <div className={`text-2xl font-mono font-bold ${netIncome >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                        {netIncome.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                    </div>
                </div>
            </div>

            {/* INCOME */}
            <div className="bg-white border border-gray-200 shadow-sm">
                <div className="px-6 py-3 border-b border-gray-200 bg-emerald-50 flex justify-between">
                    <h2 className="text-sm font-bold text-emerald-900 uppercase">Revenue / Income</h2>
                    <span className="font-mono font-bold text-emerald-900">
                        {totalIncome.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                    </span>
                </div>
                <table className="w-full text-sm">
                    <tbody className="divide-y divide-gray-100">
                        {incomeAccounts.map((acc) => (
                            <tr key={acc.id} className="hover:bg-gray-50">
                                <td className="px-6 py-3 text-gray-700">
                                    <span className="text-gray-400 mr-2 text-xs">{acc.code}</span>
                                    {acc.name}
                                </td>
                                <td className="px-6 py-3 text-right font-mono font-medium text-gray-900">
                                    {acc.balance.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                                </td>
                            </tr>
                        ))}
                        {incomeAccounts.length === 0 && (
                            <tr><td colSpan={2} className="px-6 py-4 text-gray-400 italic text-center">No revenue recorded</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* EXPENSES */}
            <div className="bg-white border border-gray-200 shadow-sm">
                <div className="px-6 py-3 border-b border-gray-200 bg-red-50 flex justify-between">
                    <h2 className="text-sm font-bold text-red-900 uppercase">Operating Expenses</h2>
                    <span className="font-mono font-bold text-red-900">
                        {totalExpenses.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                    </span>
                </div>
                <table className="w-full text-sm">
                    <tbody className="divide-y divide-gray-100">
                        {expenseAccounts.map((acc) => (
                            <tr key={acc.id} className="hover:bg-gray-50">
                                <td className="px-6 py-3 text-gray-700">
                                    <span className="text-gray-400 mr-2 text-xs">{acc.code}</span>
                                    {acc.name}
                                </td>
                                <td className="px-6 py-3 text-right font-mono font-medium text-gray-900">
                                    {acc.balance.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                                </td>
                            </tr>
                        ))}
                        {expenseAccounts.length === 0 && (
                            <tr><td colSpan={2} className="px-6 py-4 text-gray-400 italic text-center">No expenses recorded</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
