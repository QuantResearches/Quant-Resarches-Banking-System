
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";

import ConfirmationModal from "@/components/ui/ConfirmationModal";

export default function ClosePeriodButton({ periodId }: { periodId: string }) {
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const router = useRouter();

    const handleClose = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/compliance/period/${periodId}/close`, {
                method: "POST"
            });

            if (!res.ok) throw new Error("Failed to close period");

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
                className="text-red-600 hover:text-red-800 font-medium text-xs flex items-center gap-1 ml-auto disabled:opacity-50"
            >
                <Lock size={12} />
                {loading ? "Closing..." : "Close Period"}
            </button>

            <ConfirmationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleClose}
                title="Close Fiscal Period?"
                message="WARNING: Closing this period will permanently BLOCK all new transactions for these dates. This action cannot be undone. Are you sure you want to proceed?"
                confirmText="Close Period"
                isDestructive={true}
                isLoading={loading}
            />
        </>
    );
}
