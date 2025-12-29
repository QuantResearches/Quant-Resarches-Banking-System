
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

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
        <div className="space-y-8 max-w-5xl mx-auto">
            <div className="flex justify-between items-center border-b border-gray-200 pb-4">
                <div>
                    <a href="/reports" className="text-sm text-blue-600 hover:underline mb-2 inline-block">&larr; Back to Reports</a>
                    <h1 className="text-2xl font-bold text-slate-900">Balance Sheet</h1>
                    <p className="text-slate-500 text-sm">General Ledger Statement</p>
                </div>
                <div className="text-right">
                    <div className="text-sm font-medium text-slate-500 uppercase tracking-wider">Net Position</div>
                    <div className={`text-2xl font-mono font-bold ${netPosition >= 0 ? 'text-slate-900' : 'text-red-600'}`}>
                        {netPosition.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">

                {/* ASSETS */}
                <div className="bg-white border border-gray-200 shadow-sm">
                    <div className="px-6 py-4 border-b border-gray-200 bg-emerald-50 flex justify-between">
                        <h2 className="text-sm font-bold text-emerald-900 uppercase">Assets</h2>
                        <span className="font-mono font-bold text-emerald-900">
                            {totals.asset.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                        </span>
                    </div>
                    <table className="w-full text-sm">
                        <tbody className="divide-y divide-gray-100">
                            {groups.asset.map((acc) => (
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
                            {groups.asset.length === 0 && (
                                <tr><td colSpan={2} className="px-6 py-4 text-gray-400 italic text-center">No assets recorded</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* LIABILITIES */}
                <div className="bg-white border border-gray-200 shadow-sm">
                    <div className="px-6 py-4 border-b border-gray-200 bg-red-50 flex justify-between">
                        <h2 className="text-sm font-bold text-red-900 uppercase">Liabilities</h2>
                        <span className="font-mono font-bold text-red-900">
                            {totals.liability.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                        </span>
                    </div>
                    <table className="w-full text-sm">
                        <tbody className="divide-y divide-gray-100">
                            {groups.liability.map((acc) => (
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
                            {groups.liability.length === 0 && (
                                <tr><td colSpan={2} className="px-6 py-4 text-gray-400 italic text-center">No liabilities recorded</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* P&L SUMMARY */}
            <div className="bg-white border border-gray-200 shadow-sm max-w-2xl">
                <div className="px-6 py-4 border-b border-gray-200 bg-slate-50 flex justify-between">
                    <h2 className="text-sm font-bold text-slate-900 uppercase">Income Statement (YTD)</h2>
                    <span className={`font-mono font-bold ${netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {netIncome.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                    </span>
                </div>
                <table className="w-full text-sm">
                    <tbody className="divide-y divide-gray-100">
                        <tr className="bg-green-50/50">
                            <td className="px-6 py-3 font-medium text-gray-700">Total Income</td>
                            <td className="px-6 py-3 text-right font-mono text-green-700">
                                {totals.income.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                            </td>
                        </tr>
                        {groups.income.map((acc) => (
                            <tr key={acc.id} className="hover:bg-gray-50">
                                <td className="px-6 py-3 text-gray-500 pl-10 text-xs">
                                    {acc.code} - {acc.name}
                                </td>
                                <td className="px-6 py-3 text-right font-mono text-xs text-gray-500">
                                    {acc.balance.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                                </td>
                            </tr>
                        ))}
                        <tr className="bg-red-50/50">
                            <td className="px-6 py-3 font-medium text-gray-700">Total Expenses</td>
                            <td className="px-6 py-3 text-right font-mono text-red-700">
                                {totals.expense.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}
