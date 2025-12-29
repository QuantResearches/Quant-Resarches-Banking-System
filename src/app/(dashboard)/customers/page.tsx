import prisma from "@/lib/prisma";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Plus } from "lucide-react";
import { maskEmail, maskPhone } from "@/lib/masking";

export const dynamic = 'force-dynamic';

export default async function CustomersPage() {
    const session = await getServerSession(authOptions);
    const customers = await prisma.customer.findMany({
        orderBy: { created_at: "desc" },
    });

    const canCreate = session?.user?.role === "admin" || session?.user?.role === "finance";

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold">Customers</h1>
                {canCreate && (
                    <Link href="/customers/create" className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 rounded-none transition-colors">
                        <Plus className="w-4 h-4" />
                        New Customer
                    </Link>
                )}
            </div>

            <div className="bg-white border border-gray-200 overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-700 font-medium uppercase border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4">Full Name</th>
                            <th className="px-6 py-4">Email</th>
                            <th className="px-6 py-4">Phone</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 text-gray-600">
                        {customers.map((customer) => (
                            <tr key={customer.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium text-gray-900">
                                    <Link href={`/customers/${customer.id}`} className="hover:text-blue-600 hover:underline">
                                        {customer.full_name}
                                    </Link>
                                </td>
                                <td className="px-6 py-4">{maskEmail(customer.email)}</td>
                                <td className="px-6 py-4">{maskPhone(customer.phone) || "-"}</td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-none ${customer.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                        {customer.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-3">
                                        <Link href={`/customers/${customer.id}`} className="text-gray-600 hover:underline">
                                            View
                                        </Link>
                                        {canCreate && (
                                            <Link href={`/customers/${customer.id}/edit`} className="text-blue-600 hover:underline">
                                                Edit
                                            </Link>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {customers.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                    No customers found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
