import prisma from "@/lib/prisma";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Plus } from "lucide-react";
import CopyableText from "@/components/ui/CopyableText";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { Card } from "@/components/ui/Card";

export const dynamic = 'force-dynamic';

export default async function TransactionsPage() {
    const session = await getServerSession(authOptions);
    const transactions = await prisma.transaction.findMany({
        include: {
            account: {
                select: { id: true, account_type: true, customer: { select: { full_name: true } } }
            },
            creator: {
                select: { email: true }
            }
        },
        orderBy: { created_at: "desc" },
        take: 100
    });

    const canCreate = session?.user.role === "admin" || session?.user.role === "finance";

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold">Transactions</h1>
                {canCreate && (
                    <Link href="/transactions/create" className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 rounded-none transition-colors">
                        <Plus className="w-4 h-4" />
                        New Transaction
                    </Link>
                )}
            </div>

            <Card>
                <div className="relative w-full overflow-auto">
                    <Table>
                        <TableHeader className="bg-slate-50">
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Account</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Reference</TableHead>
                                <TableHead>Creator</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {transactions.map((txn) => (
                                <TableRow key={txn.id}>
                                    <TableCell className="whitespace-nowrap">{txn.created_at.toLocaleString()}</TableCell>
                                    <TableCell>
                                        <div className="font-medium text-slate-900">{txn.account.customer.full_name}</div>
                                        <CopyableText text={txn.account.id} truncateLength={8} className="text-slate-500" />
                                    </TableCell>
                                    <TableCell>
                                        <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-md ${txn.txn_type === "credit" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                            {txn.txn_type}
                                        </span>
                                    </TableCell>
                                    <TableCell className={`font-mono font-medium ${txn.txn_type === "credit" ? "text-emerald-600" : "text-red-600"}`}>
                                        {txn.txn_type === "credit" ? "+" : "-"}
                                        {Number(txn.amount).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                                    </TableCell>
                                    <TableCell>{txn.reference || "-"}</TableCell>
                                    <TableCell className="text-xs text-slate-500">{txn.creator.email}</TableCell>
                                    <TableCell>
                                        <Link href={`/transactions/${txn.id}`} className="text-blue-600 hover:underline font-medium text-xs">
                                            View
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {transactions.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center text-slate-500">
                                        No transactions found.
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
