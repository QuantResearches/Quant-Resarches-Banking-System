import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import CustomerCharts from "@/components/charts/CustomerCharts";
import { MoveLeft, User, Phone, Mail, Wallet, ShieldCheck, ExternalLink, MapPin, Calendar, CreditCard, Flag } from "lucide-react";
import Link from "next/link";
import CopyableText from "@/components/ui/CopyableText";
import { maskEmail, maskPhone } from "@/lib/masking";
import CreateAccountModal from "@/components/accounts/CreateAccountModal";
import { formatCurrency } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import AvatarUpload from "@/components/customers/AvatarUpload";
import { decrypt } from "@/lib/crypto";

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
            creator: { select: { email: true } },
            profile: true
        }
    });

    if (!customer) return <div>Customer not found</div>;

    const totalBalance = customer.accounts.reduce((sum, acc) => sum + Number(acc.balance?.balance || 0), 0);

    // Decrypt fields safely
    let pan = "NOT_PROVIDED";
    let aadhaar = "NOT_PROVIDED";
    if (customer.profile) {
        try {
            if (customer.profile.pan_encrypted) pan = decrypt(customer.profile.pan_encrypted);
            if (customer.profile.aadhaar_number_encrypted) aadhaar = decrypt(customer.profile.aadhaar_number_encrypted);
        } catch (e) { }
    }

    return (
        <div className="animate-in fade-in duration-500 space-y-8">
            {/* Header */}
            <div>
                <Link href="/customers" className="text-sm font-medium text-slate-500 hover:text-slate-900 flex items-center gap-2 mb-4 transition-colors">
                    <MoveLeft className="w-4 h-4" /> Back to Customers
                </Link>
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-slate-200 pb-6">
                    <div className="flex items-center gap-6">
                        <AvatarUpload
                            customerId={customer.id}
                            currentAvatar={customer.profile?.profile_picture}
                            fullName={customer.full_name}
                        />
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                                {customer.full_name}
                            </h1>
                            <div className="flex gap-4">
                                {/* @ts-ignore */}
                                <p className="text-sm text-blue-600 font-mono mt-1 font-bold">CIF: {customer.cif_number || "N/A"}</p>
                            </div>  
                            <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                                <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> {maskEmail(customer.email)}</span>
                                <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> {maskPhone(customer.phone)}</span>
                            </div>
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

            {/* Profile Details Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Financials */}
                <div className="bg-white p-6 border border-slate-200 rounded-lg shadow-sm space-y-6">
                    <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                        <Wallet className="w-4 h-4 text-blue-600" /> Financial Snapshot
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                            <p className="text-xs text-slate-500 font-medium uppercase">Total Balance</p>
                            <p className="text-2xl font-bold text-slate-900 mt-1">{formatCurrency(totalBalance)}</p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                            <p className="text-xs text-slate-500 font-medium uppercase">Active Accounts</p>
                            <p className="text-2xl font-bold text-slate-900 mt-1">{customer.accounts.length}</p>
                        </div>
                    </div>
                </div>

                {/* Personal Details */}
                <div className="bg-white p-6 border border-slate-200 rounded-lg shadow-sm space-y-4">
                    <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                        <User className="w-4 h-4 text-blue-600" /> Personal Details
                    </h3>

                    {customer.profile ? (
                        <div className="grid grid-cols-2 gap-y-4 text-sm">
                            <div>
                                <p className="text-xs text-slate-400">Date of Birth</p>
                                <p className="font-medium text-slate-900 flex items-center gap-2">
                                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                    {customer.profile.dob ? new Date(customer.profile.dob).toLocaleDateString() : 'N/A'}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-400">Gender / Marital</p>
                                <p className="font-medium text-slate-900">{customer.profile.gender || '-'} / {customer.profile.marital_status || '-'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-400">PAN Number</p>
                                <p className="font-medium text-slate-900 flex items-center gap-2">
                                    <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                                    {pan}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-400">Aadhaar / ID</p>
                                <p className="font-medium text-slate-900 flex items-center gap-2">
                                    <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                                    {aadhaar}
                                </p>
                            </div>
                            <div className="col-span-2">
                                <p className="text-xs text-slate-400">Address</p>
                                <p className="font-medium text-slate-900 flex items-start gap-2 mt-1">
                                    <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5" />
                                    <span>
                                        {customer.profile.current_address}<br />
                                        {customer.profile.city}, {customer.profile.state} - {customer.profile.pincode}
                                    </span>
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-6 text-slate-500 text-sm">
                            No extended profile data available.
                        </div>
                    )}
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
