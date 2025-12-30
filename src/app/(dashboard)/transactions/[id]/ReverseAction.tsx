"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import StatusPopup from "@/components/ui/StatusPopup";
import { RefreshCcw, Loader2 } from "lucide-react";

export default function ReverseAction({ transactionId, currentStatus }: { transactionId: string, currentStatus: string }) {
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<"success" | "error" | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const router = useRouter();

    if (currentStatus === "reversed" || currentStatus === "failed") return null;

    const handleReverse = async () => {
        setLoading(true);
        setShowConfirm(false);
        setStatus(null);

        try {
            const res = await fetch(`/api/transactions/${transactionId}/reverse`, {
                method: "POST"
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            setStatus("success");
            setMessage("Transaction reversed successfully. Updating records...");

            setTimeout(() => {
                router.refresh();
            }, 1000); // Wait for popup to be seen

        } catch (error: any) {
            setStatus("error");
            setMessage(error.message || "Failed to reverse transaction.");
            setLoading(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setShowConfirm(true)}
                disabled={loading}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-md transition-colors border border-amber-200"
            >
                {loading ? <Loader2 className="animate-spin" size={14} /> : <RefreshCcw size={14} />}
                Reverse Transaction
            </button>

            <ConfirmationModal
                isOpen={showConfirm}
                onClose={() => setShowConfirm(false)}
                onConfirm={handleReverse}
                title="Reverse Transaction?"
                message="This will create a counter-transaction to negate the original amount. This action cannot be undone."
                confirmText={loading ? "Reversing..." : "Confirm Reversal"}
                isDestructive={true}
            />

            <StatusPopup
                status={status}
                message={message}
                onClose={() => setStatus(null)}
            />
        </>
    );
}
