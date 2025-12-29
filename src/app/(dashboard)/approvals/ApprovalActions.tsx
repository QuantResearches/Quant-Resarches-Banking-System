"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ApprovalActions({ id }: { id: string }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleAction = async (action: "approve" | "reject") => {
        if (!confirm(`Are you sure you want to ${action} this transaction?`)) return;
        setLoading(true);

        try {
            const res = await fetch(`/api/transactions/${id}/${action}`, {
                method: "PATCH",
            });

            if (!res.ok) throw new Error("Action failed");

            router.refresh();
        } catch (error) {
            alert("Failed to process request");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-end gap-2">
            <button
                onClick={() => handleAction("approve")}
                disabled={loading}
                className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 hover:bg-green-200 rounded text-xs font-semibold disabled:opacity-50"
            >
                <Check className="w-3 h-3" /> Approve
            </button>
            <button
                onClick={() => handleAction("reject")}
                disabled={loading}
                className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 hover:bg-red-200 rounded text-xs font-semibold disabled:opacity-50"
            >
                <X className="w-3 h-3" /> Reject
            </button>
        </div>
    );
}
