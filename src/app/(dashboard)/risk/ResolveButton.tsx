
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

export default function ResolveButton({ alertId }: { alertId: string }) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleResolve = async () => {
        if (!confirm("Mark this alert as Resolved?")) return;

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
        }
    };

    return (
        <button
            onClick={handleResolve}
            disabled={loading}
            className="text-green-600 hover:text-green-800 font-medium text-xs flex items-center gap-1 ml-auto disabled:opacity-50"
        >
            <CheckCircle2 size={14} />
            {loading ? "Resolving..." : "Resolve"}
        </button>
    );
}
