"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { useStatusPopup } from "@/hooks/useStatusPopup";

interface Note {
    id: string;
    note: string;
    created_at: string;
    author: {
        email: string;
        role: string;
    };
}

export default function AuditorNotes({ transactionId }: { transactionId: string }) {
    const { data: session } = useSession();
    const [notes, setNotes] = useState<Note[]>([]);
    const [newNote, setNewNote] = useState("");
    const [loading, setLoading] = useState(false);
    const { showSuccess, showError, PopupComponent } = useStatusPopup();

    const fetchNotes = async () => {
        try {
            const res = await fetch(`/api/transactions/${transactionId}/notes`);
            if (res.ok) {
                const data = await res.json();
                setNotes(data);
            }
        } catch (e) { console.error("Failed to load notes", e); }
    };

    useEffect(() => {
        fetchNotes();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [transactionId]);

    const handleAddNote = async () => {
        if (!newNote.trim()) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/transactions/${transactionId}/notes`, {
                method: "POST",
                body: JSON.stringify({ note: newNote }),
                headers: { "Content-Type": "application/json" }
            });

            if (!res.ok) throw new Error("Failed to add note");

            setNewNote("");
            fetchNotes(); // Reload notes
            showSuccess("Note added successfully");
        } catch (e: any) {
            showError(e.message || "Error adding note");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm mt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <span>Auditor Annotations</span>
                <span className="ml-2 text-xs font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {notes.length} Notes
                </span>
            </h3>

            <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                {notes.length === 0 ? <p className="text-gray-500 text-sm italic">No notes attached to this transaction.</p> : (
                    notes.map((n) => (
                        <div key={n.id} className="bg-yellow-50 border border-yellow-200 rounded p-3 text-sm">
                            <p className="text-gray-800 mb-2 whitespace-pre-wrap">{n.note}</p>
                            <div className="flex justify-between items-center text-xs text-gray-500 border-t border-yellow-200 pt-2 mt-2">
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-gray-700">{n.author.email}</span>
                                    <span className="bg-gray-100 px-1.5 py-0.5 rounded text-[10px] uppercase">{n.author.role}</span>
                                </div>
                                <span>{new Date(n.created_at).toLocaleString()}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="flex gap-2">
                <input
                    className="flex-1 p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                    placeholder="Enter compliance note, query, or observation..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                />
                <Button onClick={handleAddNote} disabled={loading}>
                    {loading ? "Adding..." : "Attach Note"}
                </Button>
            </div>

            <PopupComponent />
        </div>
    );
}
