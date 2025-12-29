
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export default async function GeneralLedgerPage() {
    await getServerSession(authOptions);

    // Fetch GL Entries (Journal)
    // @ts-ignore
    const entries = await prisma.gLEntry.findMany({
        include: {
            gl_account: true,
            transaction: true
        },
        orderBy: { posted_at: 'desc' },
        take: 200 // Limit for performance
    });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">General Ledger</h1>
                    <p className="text-slate-500 text-sm">Journal Entries (Recent 200)</p>
                </div>
                <div className="space-x-2">
                    <a href="/reports/balance-sheet" className="text-sm text-blue-600 hover:underline">
                        View Balance Sheet
                    </a>
                </div>
            </div>

            <div className="bg-white border border-gray-200 shadow-sm overflow-hidden rounded-md">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500 font-medium uppercase border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-3">Date</th>
                            <th className="px-6 py-3">Reference / Txn ID</th>
                            <th className="px-6 py-3">GL Account</th>
                            <th className="px-6 py-3 text-right">Debit</th>
                            <th className="px-6 py-3 text-right">Credit</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-gray-700">
                        {entries.map((entry: any) => (
                            <tr key={entry.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-3 text-xs whitespace-nowrap">
                                    {new Date(entry.posted_at).toLocaleString()}
                                </td>
                                <td className="px-6 py-3">
                                    <div className="text-xs font-mono text-slate-600">
                                        {entry.transaction?.reference || "N/A"}
                                    </div>
                                    <div className="text-[10px] text-slate-400 font-mono">
                                        {entry.transaction_id ? "TX-" + entry.transaction_id.slice(0, 8) : "MANUAL ADJ"}
                                    </div>
                                </td>
                                <td className="px-6 py-3">
                                    <span className="font-mono text-xs text-slate-500 mr-2">{entry.gl_account.code}</span>
                                    <span className="font-medium text-slate-800">{entry.gl_account.name}</span>
                                </td>
                                <td className="px-6 py-3 text-right font-mono font-medium text-slate-900">
                                    {entry.type === 'debit' ? (
                                        Number(entry.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })
                                    ) : (
                                        <span className="text-slate-200">-</span>
                                    )}
                                </td>
                                <td className="px-6 py-3 text-right font-mono font-medium text-slate-900">
                                    {entry.type === 'credit' ? (
                                        Number(entry.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })
                                    ) : (
                                        <span className="text-slate-200">-</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {entries.length === 0 && (
                            <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No journal entries found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
