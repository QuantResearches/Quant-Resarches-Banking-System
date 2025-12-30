import prisma from "@/lib/prisma";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Plus } from "lucide-react";
import CopyableText from "@/components/ui/CopyableText";
import { formatCurrency } from "@/lib/utils";
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
        <div className="animate-in fade-in duration-500 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Transaction Ledger</h1>
                    <p className="text-sm text-slate-500 mt-1">Global audit trail of all financial movements.</p>
                </div>
                {canCreate && (
                    <Link href="/transactions/create" className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 disabled:pointer-events-none disabled:opacity-50 bg-blue-600 text-white shadow hover:bg-blue-700 h-9 px-4 py-2">
                        <Plus className="w-4 h-4 mr-2" />
                        New Transaction
                    </Link>
                )}
            </div>

            <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm">
                <div className="relative w-full overflow-auto">
                    <Table>
                        <TableHeader className="bg-slate-50 border-b border-slate-200">
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="font-semibold text-slate-900 pl-6">Date</TableHead>
                                <TableHead className="font-semibold text-slate-900">Account</TableHead>
                                <TableHead className="font-semibold text-slate-900">Type</TableHead>
                                <TableHead className="font-semibold text-slate-900">Amount</TableHead>
                                <TableHead className="font-semibold text-slate-900">Reference</TableHead>
                                <TableHead className="font-semibold text-slate-900">Creator</TableHead>
                                <TableHead className="text-right font-semibold text-slate-900 pr-6">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {transactions.map((txn) => (
                                <TableRow key={txn.id} className="hover:bg-slate-50 border-b border-slate-100 last:border-0">
                                    <TableCell className="whitespace-nowrap font-mono text-slate-600 text-xs pl-6">{new Date(txn.created_at).toLocaleString()}</TableCell>
                                    <TableCell>
                                        <div className="font-medium text-slate-900">{txn.account.customer.full_name}</div>
                                        <CopyableText text={txn.account.id} truncateLength={8} className="text-slate-500" />
                                    </TableCell>
                                    <TableCell>
                                        <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-md uppercase tracking-wider ${txn.txn_type === "credit" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                                            {txn.txn_type}
                                        </span>
                                    </TableCell>
                                    <TableCell className={`font-mono font-medium ${txn.txn_type === "credit" ? "text-emerald-600" : "text-red-600"}`}>
                                        {txn.txn_type === "credit" ? "+" : "-"}
                                        {formatCurrency(Number(txn.amount))}
                                    </TableCell>
                                    <TableCell className="text-slate-600">{txn.reference || "-"}</TableCell>
                                    <TableCell className="text-xs text-slate-500">{txn.creator.email}</TableCell>
                                    <TableCell className="pr-6 text-right">
                                        <Link href={`/transactions/${txn.id}`} className="text-blue-600 hover:text-blue-800 font-medium text-xs uppercase tracking-wide">
                                            View
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {transactions.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-32 text-center text-slate-500">
                                        No transactions found.
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
