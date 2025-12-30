
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import UploadStatementForm from "./UploadStatementForm";
import ReconcileButton from "./ReconcileButton";

export const dynamic = 'force-dynamic';

export default async function ReconciliationPage() {
    await getServerSession(authOptions);

    // Fetch Statements
    // @ts-ignore
    const statements = await prisma.bankStatement.findMany({
        include: {
            _count: {
                select: { lines: true }
            }
        },
        orderBy: { upload_date: 'desc' }
    });

    return (
        <div className="space-y-8">
            <h1 className="text-2xl font-bold text-slate-900">Reconciliation Dashboard</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Upload */}
                <div className="lg:col-span-1">
                    <UploadStatementForm />

                    <div className="mt-6 bg-blue-50 border border-blue-100 p-4 rounded-md">
                        <h3 className="text-sm font-bold text-blue-900 mb-2">Instructions</h3>
                        <ul className="list-disc list-inside text-xs text-blue-800 space-y-1">
                            <li>Download CSV from your external bank.</li>
                            <li>Ensure columns: Date, Description, Amount.</li>
                            <li>Upload here to start matching.</li>
                        </ul>
                    </div>
                </div>

                {/* Right: List */}
                <div className="lg:col-span-2">
                    <div className="bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                            <h2 className="text-sm font-semibold text-gray-700 uppercase">Statement History</h2>
                        </div>
                        <table className="w-full text-sm text-left">
                            <thead className="text-gray-500 font-medium border-b border-gray-200 bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3">Uploaded</th>
                                    <th className="px-6 py-3">Filename</th>
                                    <th className="px-6 py-3 text-right">Lines</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {statements.map((stmt: any) => (
                                    <tr key={stmt.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-500 text-xs">
                                            {new Date(stmt.upload_date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            {stmt.filename}
                                        </td>
                                        <td className="px-6 py-4 text-right font-mono text-gray-600">
                                            {stmt._count.lines}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${stmt.status === 'processed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                {stmt.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <ReconcileButton accountId={stmt.id} />
                                        </td>
                                    </tr>
                                ))}
                                {statements.length === 0 && (
                                    <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No statements uploaded yet.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
