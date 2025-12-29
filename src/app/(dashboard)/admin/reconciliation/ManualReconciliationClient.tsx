
"use client";

import { useState, useEffect } from "react";
import { Loader2, CheckCircle, ArrowRightLeft } from "lucide-react";

export default function ManualReconciliationClient() {
    const [lines, setLines] = useState<any[]>([]);
    const [entries, setEntries] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [selectedLine, setSelectedLine] = useState<string | null>(null);
    const [selectedEntry, setSelectedEntry] = useState<string | null>(null);
    const [matching, setMatching] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/reconciliation/unmatched");
            const data = await res.json();
            setLines(data.lines || []);
            setEntries(data.entries || []);
        } catch (err: any) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleMatch = async () => {
        if (!selectedLine || !selectedEntry) return;
        setMatching(true);
        try {
            const res = await fetch("/api/reconciliation/manual", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ lineId: selectedLine, entryId: selectedEntry })
            });

            if (!res.ok) throw new Error("Match failed");

            // Remove matched items locally
            setLines(prev => prev.filter(l => l.id !== selectedLine));
            setEntries(prev => prev.filter(e => e.id !== selectedEntry));
            setSelectedLine(null);
            setSelectedEntry(null);

            alert("Matched successfully");
        } catch (err: any) {
            alert(err.message);
        } finally {
            setMatching(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading reconciliation data...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-blue-50 p-4 rounded border border-blue-100">
                <div className="flex items-center gap-2">
                    <ArrowRightLeft className="text-blue-600" />
                    <span className="font-semibold text-blue-900">Manual Matcher</span>
                    <span className="text-sm text-blue-700 ml-2">Select a bank line and a GL entry to reconcile.</span>
                </div>
                <button
                    onClick={handleMatch}
                    disabled={!selectedLine || !selectedEntry || matching}
                    className="px-6 py-2 bg-blue-600 text-white font-bold rounded shadow hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {matching ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle size={16} />}
                    Confirm Match
                </button>
            </div>

            <div className="grid grid-cols-2 gap-8">
                {/* Bank Lines */}
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 font-bold text-gray-700">
                        Unmatched Bank Lines
                    </div>
                    <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
                        {lines.map(line => (
                            <div
                                key={line.id}
                                onClick={() => setSelectedLine(line.id)}
                                className={`p-4 cursor-pointer hover:bg-blue-50 ${selectedLine === line.id ? 'bg-blue-100 ring-2 ring-inset ring-blue-500' : ''}`}
                            >
                                <div className="flex justify-between mb-1">
                                    <span className="font-mono font-bold text-gray-900">${Number(line.amount).toFixed(2)}</span>
                                    <span className="text-xs text-gray-500">{new Date(line.date).toLocaleDateString()}</span>
                                </div>
                                <p className="text-sm text-gray-600 truncate">{line.description}</p>
                            </div>
                        ))}
                        {lines.length === 0 && <div className="p-8 text-center text-gray-400 italic">No unmatched lines</div>}
                    </div>
                </div>

                {/* GL Entries */}
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 font-bold text-gray-700">
                        Unreconciled GL Entries
                    </div>
                    <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
                        {entries.map(entry => (
                            <div
                                key={entry.id}
                                onClick={() => setSelectedEntry(entry.id)}
                                className={`p-4 cursor-pointer hover:bg-green-50 ${selectedEntry === entry.id ? 'bg-green-100 ring-2 ring-inset ring-green-500' : ''}`}
                            >
                                <div className="flex justify-between mb-1">
                                    <span className={`font-mono font-bold ${entry.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                                        {entry.type === 'credit' ? '+' : '-'}${Number(entry.amount).toFixed(2)}
                                    </span>
                                    <span className="text-xs text-gray-500">{new Date(entry.posted_at).toLocaleDateString()}</span>
                                </div>
                                <div className="text-xs text-gray-500 flex justify-between">
                                    <span>{entry.gl_account.name}</span>
                                    <span>Ref: {entry.transaction?.reference || "-"}</span>
                                </div>
                            </div>
                        ))}
                        {entries.length === 0 && <div className="p-8 text-center text-gray-400 italic">No gl entries</div>}
                    </div>
                </div>
            </div>
        </div>
    );
}
