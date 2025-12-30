import prisma from "@/lib/prisma";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Plus } from "lucide-react";
import { maskEmail, maskPhone } from "@/lib/masking";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { Card } from "@/components/ui/Card";

export const dynamic = 'force-dynamic';

type Props = {
    searchParams: Promise<{ search?: string }>;
};

export default async function CustomersPage({ searchParams }: Props) {
    const session = await getServerSession(authOptions);
    const { search } = await searchParams;

    // Build filter
    const where: any = {};
    if (search) {
        where.OR = [
            { full_name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { phone: { contains: search, mode: 'insensitive' } },
        ];
    }

    const customers = await prisma.customer.findMany({
        where,
        orderBy: { created_at: "desc" },
    });

    const canCreate = session?.user?.role === "admin" || session?.user?.role === "finance";

    return (
        <div className="animate-in fade-in duration-500 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Customer Master</h1>
                    <p className="text-sm text-slate-500 mt-1">Manage customer identities, KYC status (A-I), and relationships.</p>
                </div>
                {canCreate && (
                    <Link href="/customers/create" className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 disabled:pointer-events-none disabled:opacity-50 bg-blue-600 text-white shadow hover:bg-blue-700 h-9 px-4 py-2">
                        <Plus className="w-4 h-4 mr-2" />
                        New Customer
                    </Link>
                )}
            </div>

            <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm">
                <div className="relative w-full overflow-auto">
                    <Table>
                        <TableHeader className="bg-slate-50 border-b border-slate-200">
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="w-[200px] font-semibold text-slate-900">Full Name</TableHead>
                                <TableHead className="font-semibold text-slate-900">Email</TableHead>
                                <TableHead className="font-semibold text-slate-900">Phone</TableHead>
                                <TableHead className="font-semibold text-slate-900">Status</TableHead>
                                <TableHead className="text-right font-semibold text-slate-900">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {customers.map((customer) => (
                                <TableRow key={customer.id} className="hover:bg-slate-50 border-b border-slate-100 last:border-0">
                                    <TableCell className="font-medium text-slate-900">
                                        <Link href={`/customers/${customer.id}`} className="hover:text-blue-600 transition-colors">
                                            {customer.full_name}
                                        </Link>
                                    </TableCell>
                                    <TableCell className="text-slate-600">{maskEmail(customer.email)}</TableCell>
                                    <TableCell className="text-slate-600">{maskPhone(customer.phone) || "-"}</TableCell>
                                    <TableCell>
                                        <span className={`inline-flex px-2.5 py-0.5 text-xs font-semibold rounded-full border ${customer.status === "active" ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}`}>
                                            {customer.status}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-3">
                                            <Link href={`/customers/${customer.id}`} className="text-slate-500 hover:text-blue-600 font-medium text-xs transition-colors">
                                                DETAILS
                                            </Link>
                                            {canCreate && (
                                                <Link href={`/customers/${customer.id}/edit`} className="text-slate-500 hover:text-blue-600 font-medium text-xs transition-colors">
                                                    EDIT
                                                </Link>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {customers.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-32 text-center text-slate-500">
                                        <div className="flex flex-col items-center justify-center">
                                            <p className="text-sm font-medium">No customers found</p>
                                            <p className="text-xs text-slate-400 mt-1">Get started by creating a new customer record.</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}
