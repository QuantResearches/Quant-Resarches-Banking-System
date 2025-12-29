import prisma from "@/lib/prisma";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Plus } from "lucide-react";
import { maskEmail, maskPhone } from "@/lib/masking";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { Card } from "@/components/ui/Card";

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

            <Card>
                <div className="relative w-full overflow-auto">
                    <Table>
                        <TableHeader className="bg-slate-50">
                            <TableRow>
                                <TableHead className="w-[200px]">Full Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Phone</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {customers.map((customer) => (
                                <TableRow key={customer.id}>
                                    <TableCell className="font-medium text-slate-900">
                                        <Link href={`/customers/${customer.id}`} className="hover:text-blue-600 hover:underline">
                                            {customer.full_name}
                                        </Link>
                                    </TableCell>
                                    <TableCell>{maskEmail(customer.email)}</TableCell>
                                    <TableCell>{maskPhone(customer.phone) || "-"}</TableCell>
                                    <TableCell>
                                        <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-md ${customer.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                            {customer.status}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-3">
                                            <Link href={`/customers/${customer.id}`} className="text-slate-600 hover:underline font-medium text-xs">
                                                View
                                            </Link>
                                            {canCreate && (
                                                <Link href={`/customers/${customer.id}/edit`} className="text-blue-600 hover:underline font-medium text-xs">
                                                    Edit
                                                </Link>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {customers.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center text-slate-500">
                                        No customers found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </Card>
        </div>
    );
}
