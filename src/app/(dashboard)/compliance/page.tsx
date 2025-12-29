
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ShieldCheck, Lock } from "lucide-react";
import CreatePeriodForm from "@/app/(dashboard)/compliance/CreatePeriodForm";
import ClosePeriodButton from "@/app/(dashboard)/compliance/ClosePeriodButton";

export const dynamic = 'force-dynamic';

export default async function ComplianceDashboard() {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
        return <div className="p-8 text-red-600">Unauthorized: Admin Access Required.</div>;
    }

    // Fetch Fiscal Periods
    // @ts-ignore
    const periods = await prisma.fiscalPeriod.findMany({
        include: {
            closer: { select: { email: true } }
        },
        orderBy: { start_date: 'desc' }
    });

    return (
        <div className="space-y-8">
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="text-slate-700" />
                Compliance & Fiscal Periods
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <CreatePeriodForm />
                </div>

                <div className="lg:col-span-2">
                    <div className="bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                            <h2 className="text-sm font-bold text-gray-700 uppercase">Fiscal Control</h2>
                        </div>
                        <table className="w-full text-sm text-left">
                            <thead className="text-gray-500 font-medium border-b border-gray-200 bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3">Period Name</th>
                                    <th className="px-6 py-3">Range</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3">Closed By</th>
                                    <th className="px-6 py-3 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {periods.map((period: any) => (
                                    <tr key={period.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            {period.name}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 text-xs">
                                            {new Date(period.start_date).toLocaleDateString()} - {new Date(period.end_date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            {period.status === 'closed' ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">
                                                    <Lock size={10} /> Closed
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                                                    Open
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-xs text-gray-500">
                                            {period.closer?.email || "-"}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {period.status === 'open' && (
                                                <ClosePeriodButton periodId={period.id} />
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {periods.length === 0 && (
                                    <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No fiscal periods defined.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
