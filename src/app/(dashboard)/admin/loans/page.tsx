
import prisma from "@/lib/prisma";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/utils";

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



    return (
        <div className="animate-in fade-in duration-500 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Loan Portfolio</h1>
                    <p className="text-sm text-slate-500 mt-1">Manage lending agreements, approvals, and repayment statuses.</p>
                </div>
                <Link href="/admin/loans/create" className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 disabled:pointer-events-none disabled:opacity-50 bg-blue-600 text-white shadow hover:bg-blue-700 h-9 px-4 py-2">
                    New Application
                </Link>
            </div>

            <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm">
                <div className="relative w-full overflow-auto">
                    <Table>
                        <TableHeader className="bg-slate-50 border-b border-slate-200">
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="font-semibold text-slate-900 pl-6">Reference</TableHead>
                                <TableHead className="font-semibold text-slate-900">Customer</TableHead>
                                <TableHead className="font-semibold text-slate-900">Product</TableHead>
                                <TableHead className="font-semibold text-slate-900">Amount</TableHead>
                                <TableHead className="font-semibold text-slate-900">Applied Date</TableHead>
                                <TableHead className="font-semibold text-slate-900">Status</TableHead>
                                <TableHead className="text-right font-semibold text-slate-900 pr-6">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loans.map((loan: any) => (
                                <TableRow key={loan.id} className="hover:bg-slate-50 border-b border-slate-100 last:border-0">
                                    <TableCell className="font-mono text-slate-900 pl-6">
                                        <Link href={`/admin/loans/${loan.id}`} className="hover:text-blue-600 hover:underline">
                                            {loan.id.slice(0, 8)}
                                        </Link>
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-medium text-slate-900">{loan.customer.full_name}</div>
                                        <div className="text-xs text-slate-500">{loan.customer.email}</div>
                                    </TableCell>
                                    <TableCell>{loan.product.name}</TableCell>
                                    <TableCell className="font-medium font-mono">
                                        {formatCurrency(Number(loan.applied_amount))}
                                    </TableCell>
                                    <TableCell className="text-slate-600">
                                        {new Date(loan.applied_at).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={
                                            loan.status === 'APPLIED' ? 'info' :
                                                loan.status === 'APPROVED' ? 'secondary' :
                                                    loan.status === 'ACTIVE' ? 'success' :
                                                        loan.status === 'REJECTED' ? 'destructive' :
                                                            loan.status === 'DEFAULTED' ? 'destructive' :
                                                                'neutral'
                                        } className="uppercase text-[10px]">
                                            {loan.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right pr-6">
                                        <Link href={`/admin/loans/${loan.id}`} className="text-blue-600 hover:text-blue-800 font-medium text-xs uppercase tracking-wide">
                                            View
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {loans.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-32 text-center text-slate-500">
                                        No loans found.
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
