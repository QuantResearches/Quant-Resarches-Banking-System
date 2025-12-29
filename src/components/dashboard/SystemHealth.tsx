"use client";

import { Activity, ShieldCheck, Server, AlertTriangle, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";

export default function SystemHealth() {
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
                    <div className="text-2xl font-mono font-semibold text-slate-900">100%</div>
                    <div className="text-xs text-slate-400 mt-1">Uptime (Last 30 Days)</div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Security Core</span>
                        <ShieldCheck size={14} className="text-blue-600" />
                    </div>
                    <div className="text-lg font-medium text-slate-900">Enforced</div>
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
                    <div className="text-xs text-slate-400 mt-1">Last Reconciled: 2m ago</div>
                </CardContent>
            </Card>

            <Card className="border-l-4 border-l-amber-500">
                <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Pending Actions</span>
                        <AlertTriangle size={14} className="text-amber-500" />
                    </div>
                    <div className="text-2xl font-mono font-semibold text-slate-900">3</div>
                    <div className="text-xs text-slate-400 mt-1">Requires Attention</div>
                </CardContent>
            </Card>
        </div>
    );
}
