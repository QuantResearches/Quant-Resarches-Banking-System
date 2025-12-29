"use client";

import Link from "next/link";
import { UserPlus, FileText, UploadCloud, ShieldAlert } from "lucide-react";

export default function QuickActions() {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/customers/create" className="bg-white border border-slate-200 rounded-xl p-4 hover:border-blue-500 hover:shadow-md transition-all group shadow-sm">
                <UserPlus className="text-blue-600 mb-3 group-hover:scale-110 transition-transform" />
                <div className="text-sm font-bold text-slate-800">New Customer</div>
                <div className="text-xs text-slate-500 mt-1">KYC & Onboarding</div>
            </Link>

            <Link href="/transactions" className="bg-white border border-slate-200 rounded-xl p-4 hover:border-emerald-500 hover:shadow-md transition-all group shadow-sm">
                <FileText className="text-emerald-600 mb-3 group-hover:scale-110 transition-transform" />
                <div className="text-sm font-bold text-slate-800">Ledger Entry</div>
                <div className="text-xs text-slate-500 mt-1">Post Transactions</div>
            </Link>

            <Link href="/reconciliation" className="bg-white border border-slate-200 rounded-xl p-4 hover:border-purple-500 hover:shadow-md transition-all group shadow-sm">
                <UploadCloud className="text-purple-600 mb-3 group-hover:scale-110 transition-transform" />
                <div className="text-sm font-bold text-slate-800">Upload Statement</div>
                <div className="text-xs text-slate-500 mt-1">Reconcile Accounts</div>
            </Link>

            <Link href="/risk" className="bg-white border border-slate-200 rounded-xl p-4 hover:border-red-500 hover:shadow-md transition-all group shadow-sm">
                <ShieldAlert className="text-red-600 mb-3 group-hover:scale-110 transition-transform" />
                <div className="text-sm font-bold text-slate-800">Risk Review</div>
                <div className="text-xs text-slate-500 mt-1">3 Pending Alerts</div>
            </Link>
        </div>
    );
}
