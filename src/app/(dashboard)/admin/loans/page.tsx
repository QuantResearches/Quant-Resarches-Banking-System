
import prisma from "@/lib/prisma";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

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
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Loan Agreements</h1>
                    <p className="text-sm text-gray-500">Manage loan applications and active accounts.</p>
                </div>
                <Link href="/admin/loans/create" className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700">New Application</Link>
            </div>

            <Card>
                <div className="relative w-full overflow-auto">
                    <Table>
                        <TableHeader className="bg-slate-50">
                            <TableRow>
                                <TableHead>Reference</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Product</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Applied Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loans.map((loan: any) => (
                                <TableRow key={loan.id}>
                                    <TableCell className="font-mono text-slate-900">
                                        <Link href={`/admin/loans/${loan.id}`} className="hover:text-blue-600 hover:underline">
                                            {loan.id.slice(0, 8)}
                                        </Link>
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-medium text-slate-900">{loan.customer.full_name}</div>
                                        <div className="text-xs text-slate-500">{loan.customer.email}</div>
                                    </TableCell>
                                    <TableCell>{loan.product.name}</TableCell>
                                    <TableCell className="font-medium">
                                        {Number(loan.applied_amount).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                                    </TableCell>
                                    <TableCell>
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
                                        }>
                                            {loan.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Link href={`/admin/loans/${loan.id}`} className="text-blue-600 hover:underline font-medium">
                                            View
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {loans.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center text-slate-500">
                                        No loans found.
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
