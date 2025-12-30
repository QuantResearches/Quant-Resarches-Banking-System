"use client";

import { useState } from "react";
import { Check, X, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button"; // Assuming Button component exists, or use standard button

import { useStatusPopup } from "@/hooks/useStatusPopup";

export default function KYCApprovalActions({ kycId, customerId }: { kycId: string, customerId: string }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const { showError, showSuccess, PopupComponent } = useStatusPopup();

    const handleAction = async (action: 'approve' | 'reject') => {
        setLoading(true);
        try {
            const res = await fetch(`/api/customers/${customerId}/kyc`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: action === 'approve' ? 'VERIFIED' : 'REJECTED' })
            });

            if (!res.ok) throw new Error("Action failed");

            showSuccess(`KYC ${action}d successfully`);
            router.refresh();
        } catch (e) {
            showError("Failed to process request");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-end gap-2">
            <Link
                href={`/customers/${customerId}`}
                className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded text-xs font-semibold"
            >
                <Eye className="w-3 h-3" /> Review
            </Link>
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
