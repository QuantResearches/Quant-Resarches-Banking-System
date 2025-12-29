
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Undo2, Loader2, AlertTriangle } from "lucide-react";

import ConfirmationModal from "@/components/ui/ConfirmationModal";

export default function ReverseAction({
    transactionId,
    status,
    isReversed
}: {
    transactionId: string,
    status: string,
    isReversed: boolean
}) {
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const router = useRouter();

    if (status !== "POSTED" || isReversed) return null;

    const handleReverse = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/transactions/${transactionId}/reverse`, {
                method: "POST"
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error);

            alert("Transaction Reversed Successfully");
            router.refresh();

        } catch (err: any) {
            alert(err.message);
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
                className="flex items-center gap-2 px-4 py-2 bg-white border border-red-200 text-red-700 rounded hover:bg-red-50 text-sm font-medium disabled:opacity-50"
            >
                {loading ? "Reversing..." : (
                    <>
                        <Undo2 size={16} />
                        Reverse Transaction
                    </>
                )}
            </button>

            <ConfirmationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleReverse}
                title="Reverse Transaction?"
                message="Are you sure you want to REVERSE this transaction? This will create a contra-entry to nullify the effect. This action cannot be undone."
                confirmText="Reverse"
                isDestructive={true}
                isLoading={loading}
            />
        </>
    );
}
