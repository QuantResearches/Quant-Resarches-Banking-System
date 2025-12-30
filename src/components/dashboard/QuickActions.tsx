"use client";

import Link from "next/link";
import { UserPlus, FileText, UploadCloud, ShieldAlert } from "lucide-react";

export default function QuickActions() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link href="/customers/create" className="flex flex-col h-full bg-white border border-slate-200 rounded-lg p-5 hover:border-blue-600 hover:ring-1 hover:ring-blue-600/20 hover:shadow-md transition-all group shadow-sm">
                <div className="flex-1">
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <UserPlus className="w-5 h-5 text-blue-600 group-hover:text-white transition-colors" />
                    </div>
                    <div className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors">New Customer</div>
                    <div className="text-xs text-slate-500 mt-1 leading-snug">KYC, Profile Setup & Onboarding</div>
                </div>
            </Link>

            <Link href="/transactions" className="flex flex-col h-full bg-white border border-slate-200 rounded-lg p-5 hover:border-emerald-600 hover:ring-1 hover:ring-emerald-600/20 hover:shadow-md transition-all group shadow-sm">
                <div className="flex-1">
                    <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                        <FileText className="w-5 h-5 text-emerald-600 group-hover:text-white transition-colors" />
                    </div>
                    <div className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">Ledger Entry</div>
                    <div className="text-xs text-slate-500 mt-1 leading-snug">Post Journal Entries & Transactions</div>
                </div>
            </Link>

            <Link href="/reconciliation" className="flex flex-col h-full bg-white border border-slate-200 rounded-lg p-5 hover:border-purple-600 hover:ring-1 hover:ring-purple-600/20 hover:shadow-md transition-all group shadow-sm">
                <div className="flex-1">
                    <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                        <UploadCloud className="w-5 h-5 text-purple-600 group-hover:text-white transition-colors" />
                    </div>
                    <div className="text-sm font-bold text-slate-900 group-hover:text-purple-700 transition-colors">Upload Statement</div>
                    <div className="text-xs text-slate-500 mt-1 leading-snug">Bank Statement Reconciliation</div>
                </div>
            </Link>

            <Link href="/risk" className="flex flex-col h-full bg-white border border-slate-200 rounded-lg p-5 hover:border-amber-600 hover:ring-1 hover:ring-amber-600/20 hover:shadow-md transition-all group shadow-sm">
                <div className="flex-1">
                    <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                        <ShieldAlert className="w-5 h-5 text-amber-600 group-hover:text-white transition-colors" />
                    </div>
                    <div className="text-sm font-bold text-slate-900 group-hover:text-amber-700 transition-colors">Risk Review</div>
                    <div className="text-xs text-slate-500 mt-1 leading-snug">Review Flagged Activities</div>
                </div>
            </Link>
        </div>
    );
}
