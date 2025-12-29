
"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { generateStatementPDF } from "@/lib/pdf-generator";

export default function DownloadStatement({ account }: { account: any }) {
    const [loading, setLoading] = useState(false);

    const handleDownload = async () => {
        setLoading(true);
        try {
            // 1. Define Period (Last 30 Days for MVP)
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - 30);

            // 2. Fetch Transactions (Client-side fetch to reuse API logic)
            // We need to fetch ALL transactions for this period. 
            // The API /api/accounts/[id]/transactions might be paginated.
            // For MVP: Fetching default page 1 (usually 50 items).
            // A dedicated 'statement' API would be better, but reusing list for simplicity.

            const res = await fetch(`/api/accounts/${account.id}/transactions?limit=1000`);
            const data = await res.json();

            if (!data.transactions) throw new Error("Failed to fetch transactions");

            const transactions = data.transactions.filter((t: any) => {
                const d = new Date(t.effective_date);
                return d >= startDate && d <= endDate;
            });

            // 3. Generate PDF
            generateStatementPDF(account, transactions, {
                start: startDate.toLocaleDateString(),
                end: endDate.toLocaleDateString()
            });

        } catch (err: any) {
            alert("Error generating statement: " + err.message);
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleDownload}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
        >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            Statement
        </button>
    );
}
