"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import { useRouter } from "next/navigation";

import ConfirmationModal from "@/components/ui/ConfirmationModal";

export default function ApprovalActions({ id }: { id: string }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [pendingAction, setPendingAction] = useState<"approve" | "reject" | null>(null);

    const handleConfirm = async () => {
        if (!pendingAction) return;

        setLoading(true);
        try {
            const res = await fetch(`/api/transactions/${id}/${pendingAction}`, {
                method: "PATCH",
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
                title={pendingAction === "approve" ? "Approve Transaction" : "Reject Transaction"}
                message={`Are you sure you want to ${pendingAction} this transaction? This action will be recorded in the audit log.`}
                confirmText={pendingAction === "approve" ? "Approve" : "Reject"}
                isDestructive={pendingAction === "reject"}
                isLoading={loading}
            />
        </>
    );
}
