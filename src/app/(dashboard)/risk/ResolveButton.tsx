
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

import ConfirmationModal from "@/components/ui/ConfirmationModal";

export default function ResolveButton({ alertId }: { alertId: string }) {
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const router = useRouter();

    const handleResolve = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/risk/${alertId}/resolve`, {
                method: "POST"
            });

            if (!res.ok) throw new Error("Failed to resolve");

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
                className="text-green-600 hover:text-green-800 font-medium text-xs flex items-center gap-1 ml-auto disabled:opacity-50"
            >
                <CheckCircle2 size={14} />
                {loading ? "Resolving..." : "Resolve"}
            </button>

            <ConfirmationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleResolve}
                title="Resolve Security Alert"
                message="Are you sure you want to mark this security alert as Resolved? This indicates the risk has been mitigated or verified as a false positive."
                confirmText="Mark Resolved"
                isLoading={loading}
            />
        </>
    );
}
