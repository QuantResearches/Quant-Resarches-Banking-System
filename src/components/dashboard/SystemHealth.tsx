"use client";

import { Activity, ShieldCheck, Server, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface SystemHealthProps {
    stats: {
        uptime_percentage: number;
        security_status: "secure" | "at_risk" | "breached";
        mfa_enabled_count: number;
        last_reconciled: Date | null;
        pending_actions: number;
        pending_breakdown?: {
            kyc: number;
            loans: number;
            risk: number;
        };
    }
}

export default function SystemHealth({ stats }: SystemHealthProps) {
    // Defaults if stats are missing (loading state or error)
    const {
        uptime_percentage = 100,
        security_status = "secure",
        last_reconciled = null,
        pending_actions = 0
    } = stats || {};

    const isSecure = security_status === "secure";

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">System Status</span>
                        <div className="flex items-center gap-1 text-emerald-600">
                            <Activity size={14} />
                            <span className="text-xs font-bold">OPERATIONAL</span>
                        </div>
                    </div>
                    <div className="text-2xl font-mono font-semibold text-slate-900">{uptime_percentage}%</div>
                    <div className="text-xs text-slate-400 mt-1">Uptime (Last 30 Days)</div>
                </CardContent>
            </Card>

            <Card className={cn("border-l-4", isSecure ? "border-l-blue-500" : "border-l-red-500")}>
                <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Security Core</span>
                        {isSecure ? (
                            <ShieldCheck size={14} className="text-blue-600" />
                        ) : (
                            <XCircle size={14} className="text-red-600" />
                        )}
                    </div>
                    <div className="text-lg font-medium text-slate-900">
                        {isSecure ? "Enforced" : "Attention Needed"}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">MFA & RBAC Active</div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ledger Integrity</span>
                        <CheckCircle size={14} className="text-emerald-600" />
                    </div>
                    <div className="text-lg font-medium text-slate-900">Synced</div>
                    <div className="text-xs text-slate-400 mt-1">
                        {last_reconciled ? `Last Reconciled: ${formatDistanceToNow(last_reconciled)} ago` : "No reconciliation data"}
                    </div>
                </CardContent>
            </Card>

            <Card className={cn("border-l-4", pending_actions > 0 ? "border-l-amber-500" : "border-l-emerald-500")}>
                <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className={cn("text-xs font-bold uppercase tracking-wider", pending_actions > 0 ? "text-amber-600" : "text-emerald-600")}>
                            {pending_actions > 0 ? "Pending Actions" : "All Clear"}
                        </span>
                        {pending_actions > 0 ? (
                            <AlertTriangle size={14} className="text-amber-500" />
                        ) : (
                            <CheckCircle size={14} className="text-emerald-500" />
                        )}
                    </div>
                    <div className="text-2xl font-mono font-semibold text-slate-900">{pending_actions}</div>

                    {pending_actions > 0 ? (
                        <div className="mt-2 space-y-1">
                            {(stats.pending_breakdown?.kyc ?? 0) > 0 && (
                                <a href="/approvals" className="block text-xs text-blue-600 hover:underline flex items-center justify-between">
                                    <span>KYC Verifications</span>
                                    <span className="font-bold">{stats.pending_breakdown?.kyc}</span>
                                </a>
                            )}
                            {(stats.pending_breakdown?.loans ?? 0) > 0 && (
                                <a href="/admin/loans" className="block text-xs text-blue-600 hover:underline flex items-center justify-between">
                                    <span>Loan Requests</span>
                                    <span className="font-bold">{stats.pending_breakdown?.loans}</span>
                                </a>
                            )}
                            {(stats.pending_breakdown?.risk ?? 0) > 0 && (
                                <a href="/risk" className="block text-xs text-red-600 hover:underline flex items-center justify-between">
                                    <span>Risk Alerts</span>
                                    <span className="font-bold">{stats.pending_breakdown?.risk}</span>
                                </a>
                            )}
                        </div>
                    ) : (
                        <div className="text-xs text-slate-400 mt-1">System optimized</div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
