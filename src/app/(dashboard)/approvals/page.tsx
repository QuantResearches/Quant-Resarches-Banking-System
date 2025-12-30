import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
// Switching to relative path to ensure resolution
import ApprovalActions from "./ApprovalActions";
import KYCApprovalActions from "./KYCApprovalActions";

export const dynamic = 'force-dynamic';

export default async function ApprovalsPage() {
    const session = await getServerSession(authOptions);

    // Only Admin and Finance can approve
    if (session?.user.role !== "admin" && session?.user.role !== "finance") {
        redirect("/dashboard");
    }

    // Fetch Pending Transactions
    const pendingTxns: any[] = await prisma.transaction.findMany({
        where: { status: "PENDING" } as any,
        include: {
            account: {
                select: { id: true, account_type: true, customer: { select: { full_name: true } } }
            },
            creator: {
                select: { email: true }
            }
        },
        orderBy: { created_at: "asc" }
    });

    // Fetch Pending KYC
    const pendingKYC = await prisma.customerProfile.findMany({
        where: { kyc_status: "PENDING_VERIFICATION" },
        include: {
            customer: { select: { id: true, full_name: true, email: true, phone: true } }
        },
        orderBy: { created_at: "asc" }
    });

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Approvals & Verification</h1>
                <p className="text-sm text-slate-500">Review pending transactions and customer verifications.</p>
            </div>

            {/* Section 1: Pending KYC Verifications */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold text-slate-800">Pending KYC Verifications</h2>
                    <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">{pendingKYC.length}</span>
                </div>

                <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-700 font-medium uppercase border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4">Submitted</th>
                                <th className="px-6 py-4">Customer Name</th>
                                <th className="px-6 py-4">Contact</th>
                                <th className="px-6 py-4">Risk Profile</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 text-slate-600">
                            {pendingKYC.map((profile) => (
                                <tr key={profile.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 whitespace-nowrap">{new Date(profile.created_at).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 font-medium text-slate-900">{profile.customer.full_name}</td>
                                    <td className="px-6 py-4">
                                        <div className="text-xs">{profile.customer.email}</div>
                                        <div className="text-xs text-slate-500">{profile.customer.phone}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-xs font-bold">Unverified</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <KYCApprovalActions kycId={profile.id} customerId={profile.customer.id} />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {pendingKYC.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                        All customer KYCs are verified.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Section 2: Pending Transactions */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold text-slate-800">Pending Transactions</h2>
                    <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-0.5 rounded-full">{pendingTxns.length}</span>
                </div>

                <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-700 font-medium uppercase border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Maker</th>
                                <th className="px-6 py-4">Customer</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4">Amount</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 text-slate-600">
                            {pendingTxns.map((txn) => (
                                <tr key={txn.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 whitespace-nowrap">{txn.created_at.toLocaleString()}</td>
                                    <td className="px-6 py-4">{txn.creator.email}</td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-slate-900">{txn.account.customer.full_name}</div>
                                        <div className="text-xs font-mono">{txn.account_id.slice(0, 8)}...</div>
                                    </td>
                                    <td className="px-6 py-4 uppercase font-bold text-xs">{txn.txn_type}</td>
                                    <td className="px-6 py-4 font-mono font-medium text-slate-900">
                                        {Number(txn.amount).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <ApprovalActions approvalId={txn.id} />
                                    </td>
                                </tr>
                            ))}
                            {pendingTxns.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                        No pending transactions found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
