
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Loader2, ShieldCheck, AlertCircle, FileText, CheckCircle, XCircle } from "lucide-react";

export default function KYCDashboard() {
    const [profiles, setProfiles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProfiles();
    }, []);

    const fetchProfiles = async () => {
        try {
            // We need a specific list API. Reusing customer list but focusing on Profiles?
            // Actually, I don't have a LIST profiles API yet.
            // I'll quickly fetch all customers and their profile status via a new fetch or modified API.
            // For now, let's assume /api/customers includes profile info OR create a listing API.
            // I'll create a dedicated CLIENT-SIDE fetch to /api/kyc/list if I had one.
            // Wait, I only made GET /api/kyc/profile?customer_id=...
            // I need a LIST endpoint.

            // Temporary: Fetch customers and filter/show status.
            const res = await fetch("/api/customers");
            const customers = await res.json();

            // For each customer, fetch their profile status? N+1 problem but okay for MVP demo.
            // Ideally backend list.
            const enriched = await Promise.all(customers.map(async (c: any) => {
                const pRes = await fetch(`/api/kyc/profile?customer_id=${c.id}`);
                const profile = await pRes.json();
                return { ...c, profile: profile.id ? profile : null };
            }));

            setProfiles(enriched);
            setLoading(false);
        } catch (e) {
            console.error(e);
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">KYC Operations</h1>
                    <p className="text-sm text-gray-500">Identity Verification & Risk Assessment</p>
                </div>
                <button className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700">
                    Export Report
                </button>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
                        <tr>
                            <th className="px-6 py-3">Customer</th>
                            <th className="px-6 py-3">Email</th>
                            <th className="px-6 py-3">KYC Status</th>
                            <th className="px-6 py-3">Last Updated</th>
                            <th className="px-6 py-3">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {profiles.map((c) => (
                            <tr key={c.id} className="bg-white border-b hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium text-gray-900">{c.full_name}</td>
                                <td className="px-6 py-4 text-gray-500">{c.email}</td>
                                <td className="px-6 py-4">
                                    <StatusBadge status={c.profile?.kyc_status || "NOT_INITIALIZED"} />
                                </td>
                                <td className="px-6 py-4 text-gray-500">
                                    {c.profile?.updated_at ? new Date(c.profile.updated_at).toLocaleDateString() : "-"}
                                </td>
                                <td className="px-6 py-4">
                                    {c.profile ? (
                                        <Link href={`/admin/kyc/${c.id}`} className="text-blue-600 hover:underline font-medium">Verify</Link>
                                    ) : (
                                        // Auto-create hook?
                                        <span className="text-gray-400 italic">No Profile</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles: any = {
        VERIFIED: "bg-green-100 text-green-800",
        PENDING_VERIFICATION: "bg-yellow-100 text-yellow-800",
        REJECTED: "bg-red-100 text-red-800",
        DRAFT: "bg-gray-100 text-gray-800",
        NOT_INITIALIZED: "bg-gray-50 text-gray-400"
    };
    return (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || styles.DRAFT}`}>
            {status}
        </span>
    );
}
