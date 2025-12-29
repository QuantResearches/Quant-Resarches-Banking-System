
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";

export default function ReconcileButton() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleReconcile = async () => {
        if (!confirm("Run Auto-Reconciliation based on Exact Amount and Date (+/- 1 Day)?")) return;

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
        }
    };

    return (
        <button
            onClick={handleReconcile}
            disabled={loading}
            className="text-blue-600 hover:text-blue-800 font-medium text-xs flex items-center gap-1 disabled:opacity-50 disabled:cursor-wait"
        >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            {loading ? "Matching..." : "Reconcile"}
        </button>
    );
}
