
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";

import ConfirmationModal from "@/components/ui/ConfirmationModal";

import { useStatusPopup } from "@/hooks/useStatusPopup";

export default function ReconcileButton({ accountId }: { accountId: string }) {
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const router = useRouter();
    const { showError, showSuccess, PopupComponent } = useStatusPopup();

    const handleReconcile = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/reconciliation/auto-match`, {
                method: "POST",
                body: JSON.stringify({ account_id: accountId }),
                headers: { "Content-Type": "application/json" }
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Failed to reconcile");

            showSuccess(`Success! Auto-matched ${data.matched} lines.`);
            router.refresh();

        } catch (error: any) {
            showError("Error: " + error.message);
        } finally {
            setLoading(false);
            setIsModalOpen(false);
        }
    };

    return (
        <>
            <button
                onClick={handleReconcile}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 disabled:opacity-50"
            >
                <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                {loading ? "Matching..." : "Auto-Reconcile"}
            </button>
            <ConfirmationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleReconcile}
                title="Run Auto-Reconciliation?"
                message="This will attempt to automatically match bank statement lines to transaction ledger entries based on Exact Amount and Date (+/- 1 Day). Only high-confidence matches will be linked."
                confirmText="Run Auto-Match"
                isLoading={loading}
            />
        </>
    );
}
