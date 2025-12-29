import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import CustomerCharts from "@/components/charts/CustomerCharts";
import { MoveLeft, User, Building } from "lucide-react";
import Link from "next/link";
import CopyableText from "@/components/ui/CopyableText";
import { maskEmail, maskPhone } from "@/lib/masking";

export const dynamic = 'force-dynamic';

export default async function CustomerDetailPage(props: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    const params = await props.params;

    const customer = await prisma.customer.findUnique({
        where: { id: params.id },
        include: {
            accounts: {
                include: { balance: true }
            },
            creator: { select: { email: true } }
        }
    });

    if (!customer) return <div>Customer not found</div>;

    const totalBalance = customer.accounts.reduce((sum, acc) => sum + Number(acc.balance?.balance || 0), 0);

    return (
        <div>
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <Link href="/customers" className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-2 mb-2">
                        <MoveLeft className="w-4 h-4" /> Back to Customers
                    </Link>
                    <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
                        <User className="w-6 h-6 text-gray-700" />
                        {customer.full_name}
                    </h1>
                </div>
                <div className="text-right">
                    <Link href={`/customers/${customer.id}/edit`} className="inline-block bg-white text-gray-700 border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50">
                        Edit Profile
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 border border-gray-200">
                    <p className="text-xs text-gray-500 uppercase font-bold mb-2">Contact Info</p>
                    <p className="font-medium text-gray-900">{maskEmail(customer.email)}</p>
                    <p className="text-gray-600">{maskPhone(customer.phone)}</p>
                </div>
                <div className="bg-white p-6 border border-gray-200">
                    <p className="text-xs text-gray-500 uppercase font-bold mb-2">Total Holdings</p>
                    <p className="text-2xl font-mono font-bold text-gray-900">
                        ₹{totalBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">{customer.accounts.length} Active Accounts</p>
                </div>
                <div className="bg-white p-6 border border-gray-200">
                    <p className="text-xs text-gray-500 uppercase font-bold mb-2">Profile Status</p>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${customer.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                        {customer.status.toUpperCase()}
                    </span>
                    <p className="text-xs text-gray-400 mt-2 truncate">ID: {customer.id}</p>
                </div>
            </div>

            <CustomerCharts id={customer.id} />

            <div className="bg-white border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-900 uppercase">Accounts Portfolio</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 font-medium">
                            <tr>
                                <th className="px-6 py-3">Account ID</th>
                                <th className="px-6 py-3">Type</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3 text-right">Balance</th>
                                <th className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {customer.accounts.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">No accounts found</td>
                                </tr>
                            ) : (
                                customer.accounts.map((acc) => (
                                    <tr key={acc.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-3">
                                            <CopyableText text={acc.id} />
                                        </td>
                                        <td className="px-6 py-3 uppercase text-xs font-semibold text-gray-600">
                                            {acc.account_type}
                                        </td>
                                        <td className="px-6 py-3">
                                            <span className={`px-2 py-1 text-xs rounded-full ${acc.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                {acc.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3 text-right font-mono font-medium text-gray-900">
                                            ₹{Number(acc.balance?.balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-6 py-3">
                                            <Link href={`/accounts/${acc.id}`} className="text-blue-600 hover:underline">
                                                View Ledger
                                            </Link>
                                        </td>
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
