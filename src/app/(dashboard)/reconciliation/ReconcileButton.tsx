
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";

import ConfirmationModal from "@/components/ui/ConfirmationModal";

export default function ReconcileButton() {
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const router = useRouter();

    const handleReconcile = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/reconciliation/match", {
                method: "POST"
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Failed to reconcile");

            alert(`Success! Auto-matched ${data.matched} lines.`);
            router.refresh();

        } catch (error: any) {
            alert("Error: " + error.message);
        } finally {
            setLoading(false);
            setIsModalOpen(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setIsModalOpen(true)}
                disabled={loading}
                className="text-blue-600 hover:text-blue-800 font-medium text-xs flex items-center gap-1 disabled:opacity-50 disabled:cursor-wait"
            >
                {loading ? "Matching Records..." : (
                    <>
                        <RefreshCw size={14} />
                        Reconcile
                    </>
                )}
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
