import prisma from "@/lib/prisma";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Plus } from "lucide-react";
import CopyableText from "@/components/ui/CopyableText";

export const dynamic = 'force-dynamic';

export default async function TransactionsPage() {
    const session = await getServerSession(authOptions);
    const transactions = await prisma.transaction.findMany({
        include: {
            account: {
                select: { id: true, account_type: true, customer: { select: { full_name: true } } }
            },
            creator: {
                select: { email: true }
            }
        },
        orderBy: { created_at: "desc" },
        take: 100
    });

    const canCreate = session?.user.role === "admin" || session?.user.role === "finance";

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold">Transactions</h1>
                {canCreate && (
                    <Link href="/transactions/create" className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 rounded-none transition-colors">
                        <Plus className="w-4 h-4" />
                        New Transaction
                    </Link>
                )}
            </div>

            <div className="bg-white border border-gray-200 overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-700 font-medium uppercase border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4">Account</th>
                            <th className="px-6 py-4">Type</th>
                            <th className="px-6 py-4">Amount</th>
                            <th className="px-6 py-4">Reference</th>
                            <th className="px-6 py-4">Creator</th>
                            <th className="px-6 py-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 text-gray-600">
                        {transactions.map((txn) => (
                            <tr key={txn.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4">{txn.created_at.toLocaleString()}</td>
                                <td className="px-6 py-4">
                                    <div className="font-medium text-gray-900">{txn.account.customer.full_name}</div>
                                    <CopyableText text={txn.account.id} truncateLength={8} className="text-gray-500" />
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-none ${txn.txn_type === "credit" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                        {txn.txn_type}
                                    </span>
                                </td>
                                <td className={`px-6 py-4 font-mono font-medium ${txn.txn_type === "credit" ? "text-green-600" : "text-red-600"}`}>
                                    {txn.txn_type === "credit" ? "+" : "-"}
                                    {Number(txn.amount).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                                </td>
                                <td className="px-6 py-4">{txn.reference || "-"}</td>
                                <td className="px-6 py-4 text-xs text-gray-500">{txn.creator.email}</td>
                                <td className="px-6 py-4">
                                    <Link href={`/transactions/${txn.id}`} className="text-blue-600 hover:underline font-medium text-xs">
                                        View
                                    </Link>
                                </td>
                            </tr>
                        ))}
                        {transactions.length === 0 && (
                            <tr>
                                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                                    No transactions found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
