"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useStatusPopup } from "@/hooks/useStatusPopup";

export default function ApprovalActions({ approvalId }: { approvalId: string }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const { showError, showSuccess, PopupComponent } = useStatusPopup();

    const handleAction = async (action: 'approve' | 'reject') => {
        setLoading(true);
        try {
            // Corrected API endpoint matching existing logic
            const res = await fetch(`/api/transactions/${approvalId}/${action}`, {
                method: "PATCH",
            });

            if (!res.ok) throw new Error("Action failed");

            showSuccess(`Request ${action}d successfully`);
            router.refresh();
        } catch (error) {
            showError("Failed to process request");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-end gap-2">
            <button
                onClick={() => handleAction('approve')}
                disabled={loading}
                className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 hover:bg-green-200 rounded text-xs font-semibold disabled:opacity-50"
            >
                <Check className="w-3 h-3" /> Approve
            </button>
            <button
                onClick={() => handleAction('reject')}
                disabled={loading}
                className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 hover:bg-red-200 rounded text-xs font-semibold disabled:opacity-50"
            >
                <X className="w-3 h-3" /> Reject
            </button>
            <PopupComponent />
        </div>
    );
}
