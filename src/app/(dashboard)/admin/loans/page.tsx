
import prisma from "@/lib/prisma";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Badge } from "lucide-react"; // Using lucide foricon, but manual badge for UI

export const dynamic = 'force-dynamic';

export default async function AdminLoansPage() {
    const session = await getServerSession(authOptions);

    if (session?.user.role !== "admin" && session?.user.role !== "finance") {
        redirect("/dashboard");
    }

    // @ts-ignore
    const loans = await prisma.loan.findMany({
        include: {
            customer: { select: { full_name: true, email: true } },
            product: { select: { name: true } }
        },
        orderBy: { applied_at: 'desc' }
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case "APPLIED": return "bg-blue-100 text-blue-800";
            case "APPROVED": return "bg-purple-100 text-purple-800";
            case "ACTIVE": return "bg-green-100 text-green-800";
            case "REJECTED": return "bg-red-100 text-red-800";
            case "CLOSED": return "bg-gray-100 text-gray-800";
            case "DEFAULTED": return "bg-red-900 text-white";
            default: return "bg-gray-100 text-gray-800";
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Loan Agreements</h1>
                    <p className="text-sm text-gray-500">Manage loan applications and active accounts.</p>
                </div>
                <Link href="/admin/loans/create" className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700">New Application</Link>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-700 font-medium uppercase border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4">Reference</th>
                            <th className="px-6 py-4">Customer</th>
                            <th className="px-6 py-4">Product</th>
                            <th className="px-6 py-4">Amount</th>
                            <th className="px-6 py-4">Applied Date</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 text-gray-600">
                        {loans.map((loan: any) => (
                            <tr key={loan.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 font-mono text-gray-900">
                                    <Link href={`/admin/loans/${loan.id}`} className="hover:text-blue-600 hover:underline">
                                        {loan.id.slice(0, 8)}
                                    </Link>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="font-medium text-gray-900">{loan.customer.full_name}</div>
                                    <div className="text-xs text-gray-500">{loan.customer.email}</div>
                                </td>
                                <td className="px-6 py-4">{loan.product.name}</td>
                                <td className="px-6 py-4 font-medium">
                                    {Number(loan.applied_amount).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                                </td>
                                <td className="px-6 py-4">
                                    {new Date(loan.applied_at).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(loan.status)}`}>
                                        {loan.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <Link href={`/admin/loans/${loan.id}`} className="text-blue-600 hover:underline font-medium">
                                        View
                                    </Link>
                                </td>
                            </tr>
                        ))}
                        {loans.length === 0 && (
                            <tr>
                                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                    No loans found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
