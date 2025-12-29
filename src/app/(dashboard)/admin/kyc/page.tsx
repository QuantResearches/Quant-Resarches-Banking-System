
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Loader2, ShieldCheck, AlertCircle, FileText, CheckCircle, XCircle } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

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

            <Card>
                <div className="relative w-full overflow-auto">
                    <Table>
                        <TableHeader className="bg-slate-50">
                            <TableRow>
                                <TableHead>Customer</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>KYC Status</TableHead>
                                <TableHead>Last Updated</TableHead>
                                <TableHead>Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {profiles.map((c) => (
                                <TableRow key={c.id}>
                                    <TableCell className="font-medium text-slate-900">{c.full_name}</TableCell>
                                    <TableCell className="text-slate-500">{c.email}</TableCell>
                                    <TableCell>
                                        <StatusBadge status={c.profile?.kyc_status || "NOT_INITIALIZED"} />
                                    </TableCell>
                                    <TableCell className="text-slate-500">
                                        {c.profile?.updated_at ? new Date(c.profile.updated_at).toLocaleDateString() : "-"}
                                    </TableCell>
                                    <TableCell>
                                        {c.profile ? (
                                            <Link href={`/admin/kyc/${c.id}`} className="text-blue-600 hover:underline font-medium">Verify</Link>
                                        ) : (
                                            <span className="text-slate-400 italic">No Profile</span>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </Card>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "info" | "neutral"> = {
        VERIFIED: "success",
        PENDING_VERIFICATION: "warning",
        REJECTED: "destructive",
        DRAFT: "neutral",
        NOT_INITIALIZED: "outline"
    };

    return (
        <Badge variant={variants[status] || "neutral"}>
            {status.replace(/_/g, " ")}
        </Badge>
    );
}
