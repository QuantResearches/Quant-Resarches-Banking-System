
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ShieldAlert, CheckCircle } from "lucide-react";
import ResolveButton from "./ResolveButton";

export const dynamic = 'force-dynamic';

export default async function RiskDashboard() {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
        return <div className="p-8 text-red-600">Unauthorized: Admin Access Required.</div>;
    }

    // Fetch Alerts
    // @ts-ignore
    const alerts = await prisma.riskAlert.findMany({
        where: { status: 'open' },
        include: {
            user: { select: { email: true } },
            transaction: { select: { amount: true, reference: true } }
        },
        orderBy: { created_at: 'desc' },
        take: 50
    });

    return (
        <div className="space-y-8">
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <ShieldAlert className="text-red-600" />
                Risk Management Console
            </h1>

            <div className="bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-red-50 flex justify-between items-center">
                    <h2 className="text-sm font-bold text-red-900 uppercase">Active Alerts ({alerts.length})</h2>
                </div>
                <table className="w-full text-sm text-left">
                    <thead className="text-gray-500 font-medium border-b border-gray-200 bg-gray-50">
                        <tr>
                            <th className="px-6 py-3">Date</th>
                            <th className="px-6 py-3">Severity</th>
                            <th className="px-6 py-3">Type</th>
                            <th className="px-6 py-3">User</th>
                            <th className="px-6 py-3">Description</th>
                            <th className="px-6 py-3 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {alerts.map((alert: any) => (
                            <tr key={alert.id} className="hover:bg-red-50/10 transition-colors">
                                <td className="px-6 py-4 text-xs text-gray-500 whitespace-nowrap">
                                    {new Date(alert.created_at).toLocaleString()}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex px-2 py-0.5 text-xs font-bold uppercase rounded-sm ${alert.severity === 'critical' ? 'bg-red-600 text-white' :
                                        alert.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                                            alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-blue-100 text-blue-800'
                                        }`}>
                                        {alert.severity}
                                    </span>
                                </td>
                                <td className="px-6 py-4 capitalize font-medium text-gray-800">
                                    {alert.type.replace('_', ' ')}
                                </td>
                                <td className="px-6 py-4 text-gray-600">
                                    {alert.user?.email || "Unknown"}
                                </td>
                                <td className="px-6 py-4 text-gray-800 max-w-xs truncate">
                                    {alert.description.replace(/₹(\d+)/g, (match: string, p1: string) => `₹${Number(p1).toLocaleString('en-IN')}`)}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <ResolveButton alertId={alert.id} />
                                </td>
                            </tr>
                        ))}
                        {alerts.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-12">
                                    <div className="flex flex-col items-center justify-center gap-3 text-slate-500">
                                        <div className="bg-emerald-50 p-3 rounded-full">
                                            <CheckCircle className="text-emerald-600" size={32} />
                                        </div>
                                        <span className="font-medium">System Secure. No active alerts.</span>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
