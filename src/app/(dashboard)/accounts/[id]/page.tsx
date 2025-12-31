
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import AccountCharts from "@/components/charts/AccountCharts";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Wallet, Calendar, AlertTriangle, ShieldCheck } from "lucide-react";
import CopyableText from "@/components/ui/CopyableText";
import AccountActions from "../AccountActions";
import DownloadStatement from "@/components/accounts/DownloadStatement";

export const dynamic = 'force-dynamic';

export default async function AccountDetails(props: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    const params = await props.params;

    const account = await prisma.account.findUnique({
        where: { id: params.id },
        include: {
            customer: {
                include: { profile: true }
            },
            transactions: {
                orderBy: { created_at: 'desc' },
                take: 50
            },
            balance: true
        }
    });

    if (!account) return <div className="p-8 text-center text-gray-500">Account not found</div>;

    return (
        <div>
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <Link href="/accounts" className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-2 mb-2">
                        <ArrowLeft className="w-4 h-4" /> Back to Accounts
                    </Link>
                    <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
                        <Wallet className="w-6 h-6 text-blue-600" />
                        Account Details
                    </h1>
                </div>
                <div className="text-right">
                    <p className="text-sm text-gray-500 uppercase">Current Balance</p>
                    <p className="text-3xl font-mono font-bold text-gray-900">
                        {Number(account.balance?.balance || 0).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 border border-gray-200">
                    <p className="text-xs text-gray-500 uppercase font-bold mb-2">Account Number (SBI Format)</p>
                    <p className="text-xl font-mono font-medium text-gray-900 tracking-wider">
                        {account.account_number || "N/A"}
                    </p>
                    <div className="mt-2 pt-2 border-t border-gray-100">
                        <p className="text-[10px] text-gray-400 uppercase">System Ref ID</p>
                        <CopyableText text={account.id} label="Ref ID" className="text-xs text-gray-400" />
                    </div>
                </div>
                <div className="bg-white p-6 border border-gray-200">
                    <p className="text-xs text-gray-500 uppercase font-bold mb-2">Customer</p>
                    <p className="font-medium text-blue-600 hover:underline">
                        <Link href={`/customers/${account.customer_id}`}>{account.customer.full_name}</Link>
                    </p>
                    <p className="text-sm text-gray-500">{account.customer.email}</p>
                </div>
                <div className="bg-white p-6 border border-gray-200">
                    <p className="text-xs text-gray-500 uppercase font-bold mb-2">Status</p>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${account.status === 'active' ? 'bg-green-100 text-green-800' :
                        account.status === 'frozen' ? 'bg-orange-100 text-orange-800' : 'bg-red-100 text-red-800'
                        }`}>
                        {account.status.toUpperCase()}
                    </span>
                    <p className="text-xs text-gray-400 mt-2">Type: {account.account_type.toUpperCase()}</p>
                </div>
            </div>

            <AccountCharts id={account.id} />

            <div className="bg-white border border-gray-200 mt-8">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="text-sm font-semibold text-gray-900 uppercase">Recent Transactions</h3>
                    <div className="flex items-center gap-3">
                        <DownloadStatement account={account} />

                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 font-medium">
                            <tr>
                                <th className="px-6 py-3">Date</th>
                                <th className="px-6 py-3">Type</th>
                                <th className="px-6 py-3">Amount</th>
                                <th className="px-6 py-3">Reference</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {account.transactions.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-4 text-center text-gray-500">No transactions found</td>
                                </tr>
                            ) : (
                                account.transactions.map((txn) => (
                                    <tr key={txn.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-3 whitespace-nowrap font-mono text-gray-600">
                                            {new Date(txn.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-3">
                                            <span className={`px-2 py-1 text-xs rounded-full ${txn.txn_type === 'credit' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                }`}>
                                                {txn.txn_type.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className={`px-6 py-3 font-mono font-medium ${txn.txn_type === 'credit' ? 'text-green-600' : 'text-red-600'
                                            }`}>
                                            {txn.txn_type === 'credit' ? '+' : '-'}{Number(txn.amount).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                                        </td>
                                        <td className="px-6 py-3 text-gray-500">{txn.reference || '-'}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
