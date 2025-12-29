
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle, Wallet } from "lucide-react";

interface LoanActionsProps {
    loanId: string;
    status: string;
}

import ConfirmationModal from "@/components/ui/ConfirmationModal";

export default function LoanActions({ loanId, status }: LoanActionsProps) {
    const [loading, setLoading] = useState(false);
    const [pendingAction, setPendingAction] = useState<"approve" | "disburse" | null>(null);
    const router = useRouter();

    const handleConfirm = async () => {
        if (!pendingAction) return;

        setLoading(true);
        try {
            const res = await fetch(`/api/loans/${loanId}/${pendingAction}`, { method: "POST" });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error);

            router.refresh();
            alert(`Loan ${pendingAction}d successfully!`);
        } catch (error: any) {
            alert(error.message);
        } finally {
            setLoading(false);
            setPendingAction(null);
        }
    };

    const modalTitle = pendingAction === "approve" ? "Approve Loan Application?" : "Disburse Loan Funds?";
    const modalMessage = pendingAction === "approve"
        ? "Are you sure you want to APPROVE this loan application? This will finalize the terms."
        : "Are you sure you want to DISBURSE funds? This will transfer money to the customer's account.";

    return (
        <>
            {status === "APPLIED" && (
                <button
                    onClick={() => setPendingAction("approve")}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50 text-sm font-medium"
                >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                    Approve Application
                </button>
            )}

            {status === "APPROVED" && (
                <button
                    onClick={() => setPendingAction("disburse")}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 text-sm font-medium"
                >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <Wallet size={16} />}
                    Disburse Funds
                </button>
            )}

            <ConfirmationModal
                isOpen={!!pendingAction}
                onClose={() => setPendingAction(null)}
                onConfirm={handleConfirm}
                title={modalTitle}
                message={modalMessage}
                confirmText={pendingAction === "approve" ? "Approve" : "Disburse"}
                isLoading={loading}
            />
        </>
    );
}
