import prisma from "@/lib/prisma";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Plus } from "lucide-react";
import CopyableText from "@/components/ui/CopyableText";
import AccountActions from "./AccountActions";

export const dynamic = 'force-dynamic';

export default async function AccountsPage() {
    const session = await getServerSession(authOptions);
    const accounts = await prisma.account.findMany({
        include: {
            customer: { select: { full_name: true, email: true } },
            balance: true
        },
        orderBy: { created_at: "desc" },
    });

    const canCreate = session?.user.role === "admin" || session?.user.role === "finance";

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold">Accounts</h1>
                {canCreate && (
                    <Link href="/accounts/create" className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 disabled:pointer-events-none disabled:opacity-50 bg-blue-600 text-white shadow hover:bg-blue-700 h-9 px-4 py-2">
                        <Plus className="w-4 h-4 mr-2" />
                        New Account
                    </Link>
                )}
            </div>

            <div className="bg-white border border-gray-200 overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-700 font-medium uppercase border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4">Account ID</th>
                            <th className="px-6 py-4">Customer</th>
                            <th className="px-6 py-4">Type</th>
                            <th className="px-6 py-4">Balance</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 text-gray-600">
                        {accounts.map((account) => (
                            <tr key={account.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <Link href={`/accounts/${account.id}`} className="text-blue-600 hover:underline font-mono">
                                            {account.id.slice(0, 8)}...
                                        </Link>
                                        <CopyableText text={account.id} label="Account ID" />
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="font-medium text-gray-900">{account.customer.full_name}</div>
                                    <div className="text-xs text-gray-500">{account.customer.email}</div>
                                </td>
                                <td className="px-6 py-4 capitalize">{account.account_type}</td>
                                <td className="px-6 py-4 font-mono font-medium text-gray-900">
                                    {Number(account.balance?.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-none ${account.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>
                                        {account.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <AccountActions id={account.id} status={account.status} />
                                </td>
                            </tr>
                        ))}
                        {accounts.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                    No accounts found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
