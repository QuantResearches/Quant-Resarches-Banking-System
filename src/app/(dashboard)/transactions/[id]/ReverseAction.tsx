
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Undo2, Loader2, AlertTriangle } from "lucide-react";

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
    const router = useRouter();

    if (status !== "POSTED" || isReversed) return null;

    const handleReverse = async () => {
        if (!confirm("Are you sure you want to REVERSE this transaction? This will create a contra-entry.")) return;

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
        }
    };

    return (
        <button
            onClick={handleReverse}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-red-200 text-red-700 rounded hover:bg-red-50 text-sm font-medium disabled:opacity-50"
        >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Undo2 size={16} />}
            Reverse Transaction
        </button>
    );
}
