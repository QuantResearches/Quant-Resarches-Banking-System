"use client";

import { useState } from "react";
import { Check, X, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import Link from "next/link";

export default function KYCApprovalActions({ id, customerId }: { id: string, customerId: string }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [pendingAction, setPendingAction] = useState<"approve" | "reject" | null>(null);

    const handleConfirm = async () => {
        if (!pendingAction) return;

        setLoading(true);
        try {
            const res = await fetch(`/api/customers/${customerId}/kyc`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: pendingAction === "approve" ? "VERIFIED" : "REJECTED" })
            });

            if (!res.ok) throw new Error("Action failed");

            router.refresh();
        } catch (error) {
            alert("Failed to process request");
        } finally {
            setLoading(false);
            setPendingAction(null);
        }
    };

    return (
        <>
            <div className="flex justify-end gap-2">
                <Link
                    href={`/customers/${customerId}`}
                    className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded text-xs font-semibold"
                >
                    <Eye className="w-3 h-3" /> Review
                </Link>
                <button
                    onClick={() => setPendingAction("approve")}
                    disabled={loading}
                    className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 hover:bg-green-200 rounded text-xs font-semibold disabled:opacity-50"
                >
                    <Check className="w-3 h-3" /> Approve
                </button>
                <button
                    onClick={() => setPendingAction("reject")}
                    disabled={loading}
                    className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 hover:bg-red-200 rounded text-xs font-semibold disabled:opacity-50"
                >
                    <X className="w-3 h-3" /> Reject
                </button>
            </div>

            <ConfirmationModal
                isOpen={!!pendingAction}
                onClose={() => setPendingAction(null)}
                onConfirm={handleConfirm}
                title={pendingAction === "approve" ? "Verify Customer KYC" : "Reject Customer KYC"}
                message={`Are you sure you want to ${pendingAction === "approve" ? "verify" : "reject"} this customer's KYC? This will allow them to open accounts and transact.`}
                confirmText={pendingAction === "approve" ? "Verify KYC" : "Reject KYC"}
                isDestructive={pendingAction === "reject"}
                isLoading={loading}
            />
        </>
    );
}
