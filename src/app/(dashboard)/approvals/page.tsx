import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
// Switching to absolute path might help resolution or just "touching" the import
import ApprovalActions from "@/app/(dashboard)/approvals/ApprovalActions";

export const dynamic = 'force-dynamic';

export default async function ApprovalsPage() {
    const session = await getServerSession(authOptions);

    // Only Admin and Finance can approve
    if (session?.user.role !== "admin" && session?.user.role !== "finance") {
        redirect("/dashboard");
    }

    // Explicitly cast to any to avoid IDE "Property 'x' does not exist" if it's lagging on includes
    // strict typing: Prisma.TransactionGetPayload<{include: { account: ... }}>
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

    return (
        <div>
            <h1 className="text-2xl font-semibold mb-6">Pending Approvals</h1>

            <div className="bg-white border border-gray-200 overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-700 font-medium uppercase border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4">Maker</th>
                            <th className="px-6 py-4">Customer</th>
                            <th className="px-6 py-4">Type</th>
                            <th className="px-6 py-4">Amount</th>
                            <th className="px-6 py-4 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 text-gray-600">
                        {pendingTxns.map((txn) => (
                            <tr key={txn.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">{txn.created_at.toLocaleString()}</td>
                                <td className="px-6 py-4">{txn.creator.email}</td>
                                <td className="px-6 py-4">
                                    <div className="font-medium text-gray-900">{txn.account.customer.full_name}</div>
                                    <div className="text-xs font-mono">{txn.account_id.slice(0, 8)}...</div>
                                </td>
                                <td className="px-6 py-4 uppercase font-bold text-xs">{txn.txn_type}</td>
                                <td className="px-6 py-4 font-mono font-medium text-gray-900">
                                    {Number(txn.amount).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <ApprovalActions id={txn.id} />
                                </td>
                            </tr>
                        ))}
                        {pendingTxns.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                    No pending approvals found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
