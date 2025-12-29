
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { MoveLeft, FileText, Upload } from "lucide-react";
import Link from "next/link";
import EvidenceUpload from "@/app/(dashboard)/transactions/[id]/EvidenceUpload";
import ReverseAction from "./ReverseAction";
import AuditorNotes from "./AuditorNotes";

export default async function TransactionDetailPage(props: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    const params = await props.params;

    // @ts-ignore
    const txn = await prisma.transaction.findUnique({
        where: { id: params.id },
        include: {
            account: { include: { customer: true } },
            creator: { select: { email: true } },
            approver: { select: { email: true } },
            evidence: { orderBy: { uploaded_at: 'desc' } }
        } as any
    });

    const transaction = txn as any;

    if (!transaction) return <div className="p-8">Transaction not found</div>;

    return (
        <div className="space-y-6">
            <Link href="/transactions" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900">
                <MoveLeft size={16} /> Back to Transactions
            </Link>

            <div className="flex justify-between items-start">
                <h1 className="text-2xl font-bold text-gray-900">Transaction Details</h1>
                <div className="flex items-center gap-3">
                    <ReverseAction
                        transactionId={transaction.id}
                        status={transaction.status}
                        isReversed={!!transaction.reversed_by}
                    />
                    <span className={`px-3 py-1 text-sm font-bold uppercase rounded-full ${transaction.status === 'POSTED' ? 'bg-green-100 text-green-800' :
                        transaction.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                        }`}>
                        {transaction.status}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Details Card */}
                <div className="bg-white p-6 border border-gray-200 rounded-lg shadow-sm space-y-4">
                    <h2 className="text-sm font-bold text-gray-500 uppercase border-b pb-2">Financial Info</h2>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="block text-gray-500">Amount</span>
                            <span className="font-mono text-lg font-bold">
                                {Number(transaction.amount).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                            </span>
                        </div>
                        <div>
                            <span className="block text-gray-500">Type</span>
                            <span className="uppercase font-semibold">{transaction.txn_type}</span>
                        </div>
                        <div>
                            <span className="block text-gray-500">Reference</span>
                            <span className="font-mono">{transaction.reference || "-"}</span>
                        </div>
                        <div>
                            <span className="block text-gray-500">Date</span>
                            <span>{new Date(transaction.created_at).toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                {/* Entities Card */}
                <div className="bg-white p-6 border border-gray-200 rounded-lg shadow-sm space-y-4">
                    <h2 className="text-sm font-bold text-gray-500 uppercase border-b pb-2">Entities</h2>
                    <div className="space-y-3 text-sm">
                        <div>
                            <span className="text-gray-500 block">Account</span>
                            <Link href={`/accounts/${transaction.account_id}`} className="text-blue-600 hover:underline">
                                {transaction.account.account_type.toUpperCase()} - {transaction.account_id}
                            </Link>
                        </div>
                        <div>
                            <span className="text-gray-500 block">Customer</span>
                            <Link href={`/customers/${transaction.account.customer_id}`} className="text-blue-600 hover:underline">
                                {transaction.account.customer?.full_name}
                            </Link>
                        </div>
                        <div>
                            <span className="text-gray-500 block">Created By</span>
                            <span>{transaction.creator?.email}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Evidence Section */}
            <div className="bg-white p-6 border border-gray-200 rounded-lg shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <FileText size={20} className="text-gray-500" />
                        Evidence & Attachments
                    </h2>
                </div>

                {/* Upload Component */}
                <div className="mb-6 p-4 bg-gray-50 rounded border border-gray-200">
                    <EvidenceUpload transactionId={transaction.id} />
                </div>

                {/* File List */}
                <div className="space-y-2">
                    {transaction.evidence.length === 0 ? (
                        <p className="text-gray-500 text-sm italic">No files attached yet.</p>
                    ) : (
                        transaction.evidence.map((file: any) => (
                            <div key={file.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-md hover:bg-gray-50">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 text-blue-600 rounded">
                                        <FileText size={16} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{file.filename}</p>
                                        <p className="text-xs text-gray-500">
                                            {new Date(file.uploaded_at).toLocaleString()} by User
                                        </p>
                                    </div>
                                </div>
                                <a
                                    href={file.file_path}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs bg-white border border-gray-300 px-3 py-1 rounded hover:bg-gray-100"
                                >
                                    View
                                </a>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Auditor Annotations */}
            <AuditorNotes transactionId={transaction.id} />
        </div>
    );
}
