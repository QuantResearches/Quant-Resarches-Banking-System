
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";

export default function ClosePeriodButton({ periodId }: { periodId: string }) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleClose = async () => {
        if (!confirm("WARNING: Closing this period will permanently BLOCK all new transactions for these dates. Proceed?")) return;

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
        }
    };

    return (
        <button
            onClick={handleClose}
            disabled={loading}
            className="text-red-600 hover:text-red-800 font-medium text-xs flex items-center gap-1 ml-auto disabled:opacity-50"
        >
            <Lock size={12} />
            {loading ? "Closing..." : "Close Period"}
        </button>
    );
}
