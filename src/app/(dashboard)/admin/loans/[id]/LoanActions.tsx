
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle, Wallet } from "lucide-react";

interface LoanActionsProps {
    loanId: string;
    status: string;
}

export default function LoanActions({ loanId, status }: LoanActionsProps) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleAction = async (action: "approve" | "disburse") => {
        if (!confirm(`Are you sure you want to ${action.toUpperCase()} this loan?`)) return;

        setLoading(true);
        try {
            const res = await fetch(`/api/loans/${loanId}/${action}`, { method: "POST" });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error);

            router.refresh();
            alert(`Loan ${action}d successfully!`);
        } catch (error: any) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    if (status === "APPLIED") {
        return (
            <button
                onClick={() => handleAction("approve")}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50 text-sm font-medium"
            >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                Approve Application
            </button>
        );
    }

    if (status === "APPROVED") {
        return (
            <button
                onClick={() => handleAction("disburse")}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 text-sm font-medium"
            >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Wallet size={16} />}
                Disburse Funds
            </button>
        );
    }

    return null;
}
