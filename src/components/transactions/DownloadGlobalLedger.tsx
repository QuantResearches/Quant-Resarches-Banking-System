"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import StatusPopup from "@/components/ui/StatusPopup";

export default function DownloadGlobalLedger() {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error' | null, message: string | null }>({ type: null, message: null });

    const handleDownload = async () => {
        setLoading(true);
        setStatus({ type: null, message: null }); // Reset
        try {
            // Fetch all transactions (limit 1000 for client download)
            const res = await fetch(`/api/transactions?limit=1000`);
            const data = await res.json();

            if (!data.transactions) throw new Error("Failed to fetch transactions");

            const doc = new jsPDF();

            doc.setFontSize(14);
            doc.text("GLOBAL TRANSACTION LEDGER", 105, 15, { align: "center" });
            doc.setFontSize(10);
            doc.text(`Generated on: ${new Date().toLocaleString()}`, 105, 22, { align: "center" });

            const transactions = data.transactions;

            const tableColumn = ["Date", "Account", "Type", "Amount", "Reference", "Creator"];
            const tableRows: any[] = [];

            transactions.forEach((txn: any) => {
                tableRows.push([
                    new Date(txn.created_at).toLocaleString(),
                    txn.account?.customer?.full_name || txn.account_id,
                    txn.txn_type.toUpperCase(),
                    Number(txn.amount).toFixed(2),
                    txn.reference || "-",
                    txn.creator?.email || "System"
                ]);
            });

            autoTable(doc, {
                head: [tableColumn],
                body: tableRows,
                startY: 30,
                styles: { fontSize: 8 },
                headStyles: { fillColor: [41, 128, 185] } // Blue
            });

            doc.save("Global_Ledger.pdf");
            setStatus({ type: 'success', message: 'Ledger exported successfully.' });

        } catch (err) {
            console.error(err);
            setStatus({ type: 'error', message: 'Failed to download ledger. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <button
                onClick={handleDownload}
                disabled={loading}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 h-9 px-4 py-2"
            >
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                Export PDF
            </button>
            <StatusPopup
                status={status.type}
                message={status.message}
                onClose={() => setStatus({ type: null, message: null })}
            />
        </>
    );
}
