import prisma from "@/lib/prisma";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Button } from "@/components/ui/Button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { Card } from "@/components/ui/Card";

export const dynamic = 'force-dynamic';

export default async function GeneralLedgerPage() {
    await getServerSession(authOptions);

    // Fetch GL Entries (Journal)
    // @ts-ignore
    const entries = await prisma.gLEntry.findMany({
        include: {
            gl_account: true,
            transaction: true
        },
        orderBy: { posted_at: 'desc' },
        take: 200 // Limit for performance
    });

    return (
        <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
                <div>
                    <Link href="/reports" className="group flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 mb-2">
                        <span className="mr-1 group-hover:-translate-x-1 transition-transform">&larr;</span> Back to Reports
                    </Link>
                    <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">General Ledger</h1>
                    <p className="text-sm text-slate-500 mt-1">Journal Entries Registry (Recent 200)</p>
                </div>
                <div className="flex gap-2">
                    <Link href="/reports/balance-sheet">
                        <Button variant="outline" className="bg-white hover:bg-slate-50">View Balance Sheet</Button>
                    </Link>
                </div>
            </div>

            <Card>
                <div className="relative w-full overflow-auto">
                    <Table>
                        <TableHeader className="bg-slate-50/50">
                            <TableRow>
                                <TableHead className="font-semibold text-slate-900">Date</TableHead>
                                <TableHead className="font-semibold text-slate-900">Reference / Txn ID</TableHead>
                                <TableHead className="font-semibold text-slate-900">GL Account</TableHead>
                                <TableHead className="text-right font-semibold text-slate-900">Debit</TableHead>
                                <TableHead className="text-right font-semibold text-slate-900">Credit</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {entries.map((entry: any) => (
                                <TableRow key={entry.id} className="hover:bg-slate-50">
                                    <TableCell className="text-xs whitespace-nowrap text-slate-600">
                                        {new Date(entry.posted_at).toLocaleString()}
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-xs font-mono text-slate-700">
                                            {entry.transaction?.reference || "-"}
                                        </div>
                                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                                            {entry.transaction_id ? "TX-" + entry.transaction_id.slice(0, 8).toUpperCase() : "MANUAL ADJ"}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="font-mono text-xs text-slate-400 mr-2 bg-slate-100 px-1.5 py-0.5 rounded">{entry.gl_account.code}</span>
                                        <span className="font-medium text-slate-700 text-sm">{entry.gl_account.name}</span>
                                    </TableCell>
                                    <TableCell className="text-right font-mono font-medium text-slate-900">
                                        {entry.type === 'debit' ? (
                                            Number(entry.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })
                                        ) : (
                                            <span className="text-slate-300">-</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right font-mono font-medium text-slate-900">
                                        {entry.type === 'credit' ? (
                                            Number(entry.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })
                                        ) : (
                                            <span className="text-slate-300">-</span>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {entries.length === 0 && (
                                <TableRow><TableCell colSpan={5} className="h-32 text-center text-slate-500 italic">No journal entries found in the system.</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </Card>
        </div>
    );
}
