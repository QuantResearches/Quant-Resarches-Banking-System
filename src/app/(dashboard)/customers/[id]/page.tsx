import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import CustomerCharts from "@/components/charts/CustomerCharts";
import { MoveLeft, User, Phone, Mail, Wallet, ShieldCheck, ExternalLink } from "lucide-react";
import Link from "next/link";
import CopyableText from "@/components/ui/CopyableText";
import { maskEmail, maskPhone } from "@/lib/masking";
import CreateAccountModal from "@/components/accounts/CreateAccountModal";
import { formatCurrency } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";

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
        <div className="animate-in fade-in duration-500 space-y-8">
            {/* Header */}
            <div>
                <Link href="/customers" className="text-sm font-medium text-slate-500 hover:text-slate-900 flex items-center gap-2 mb-4 transition-colors">
                    <MoveLeft className="w-4 h-4" /> Back to Customers
                </Link>
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-slate-200 pb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 border border-slate-200">
                            <User className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                                {customer.full_name}
                            </h1>
                            <p className="text-sm text-slate-500 font-mono mt-1">ID: {customer.id}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link
                            href={`/customers/${customer.id}/edit`}
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-slate-200 bg-white hover:bg-slate-50 hover:text-slate-900 h-9 px-4 py-2"
                        >
                            Edit Profile
                        </Link>
                    </div>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 border border-slate-200 rounded-lg shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-md">
                            <User className="w-4 h-4" />
                        </div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Contact Info</p>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3 text-sm">
                            <Mail className="w-4 h-4 text-slate-400" />
                            <span className="font-medium text-slate-900">{maskEmail(customer.email)}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <Phone className="w-4 h-4 text-slate-400" />
                            <span className="text-slate-600">{maskPhone(customer.phone)}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 border border-slate-200 rounded-lg shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-md">
                            <Wallet className="w-4 h-4" />
                        </div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Holdings</p>
                    </div>
                    <p className="text-3xl font-mono font-bold text-slate-900 tracking-tight">
                        {formatCurrency(totalBalance)}
                    </p>
                    <p className="text-xs text-slate-500 mt-2 font-medium flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" />
                        {customer.accounts.length} Active Accounts
                    </p>
                </div>

                <div className="bg-white p-6 border border-slate-200 rounded-lg shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-purple-50 text-purple-600 rounded-md">
                            <ShieldCheck className="w-4 h-4" />
                        </div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">KYC Status</p>
                    </div>
                    <div>
                        <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full border ${customer.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                            {customer.status.toUpperCase()}
                        </span>
                        <p className="text-xs text-slate-400 mt-3">
                            Last verified on {new Date(customer.updated_at).toLocaleDateString()}
                        </p>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="border-t border-slate-200 pt-8">
                <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-6">Financial Overview</h2>
                <CustomerCharts id={customer.id} />
            </div>

            {/* Accounts Table Section */}
            <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm">
                <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Accounts Portfolio</h3>
                    <CreateAccountModal customerId={customer.id} />
                </div>
                <div className="relative w-full overflow-auto">
                    <Table>
                        <TableHeader className="bg-slate-50 border-b border-slate-200">
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="font-semibold text-slate-900 pl-6">Account ID</TableHead>
                                <TableHead className="font-semibold text-slate-900">Type</TableHead>
                                <TableHead className="font-semibold text-slate-900">Status</TableHead>
                                <TableHead className="text-right font-semibold text-slate-900">Balance</TableHead>
                                <TableHead className="text-right font-semibold text-slate-900 pr-6">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {customer.accounts.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-32 text-center text-slate-500">
                                        No accounts found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                customer.accounts.map((acc) => (
                                    <tr key={acc.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 align-middle">
                                            <CopyableText text={acc.id} />
                                        </td>
                                        <td className="px-6 py-4 align-middle">
                                            <span className="font-medium text-slate-700 uppercase text-xs tracking-wide">
                                                {acc.account_type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 align-middle">
                                            <span className={`inline-flex px-2.5 py-0.5 text-xs font-semibold rounded-full border ${acc.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                                                {acc.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 align-middle text-right font-mono font-medium text-slate-900">
                                            {formatCurrency(Number(acc.balance?.balance || 0))}
                                        </td>
                                        <td className="px-6 py-4 align-middle text-right">
                                            <Link href={`/accounts/${acc.id}`} className="inline-flex items-center text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline">
                                                VIEW LEDGER <ExternalLink className="w-3 h-3 ml-1" />
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}
