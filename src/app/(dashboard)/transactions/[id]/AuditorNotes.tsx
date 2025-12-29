
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface AuditorNotesProps {
    transactionId: string;
}

interface Note {
    id: string;
    note: string;
    created_at: string;
    author: {
        email: string;
        role: string;
    };
}

export default function AuditorNotes({ transactionId }: AuditorNotesProps) {
    const [notes, setNotes] = useState<Note[]>([]);
    const [newNote, setNewNote] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    const fetchNotes = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/transactions/${transactionId}/notes`);
            if (res.ok) {
                const data = await res.json();
                setNotes(data);
            }
        } catch (error) {
            console.error("Failed to load notes", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchNotes();
    }, [transactionId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newNote.trim()) return;

        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/transactions/${transactionId}/notes`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ note: newNote }),
            });

            if (res.ok) {
                setNewNote("");
                fetchNotes(); // Reload list
                router.refresh(); // Refresh parent if needed
            } else {
                alert("Failed to add note");
            }
        } catch (error) {
            console.error(error);
            alert("Error adding note");
        } finally {
            setIsSubmitting(false);
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

            {/* Note List */}
            <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                {isLoading ? (
                    <div className="text-sm text-gray-500 animate-pulse">Loading notes...</div>
                ) : notes.length === 0 ? (
                    <div className="text-sm text-gray-400 italic">No notes attached to this transaction.</div>
                ) : (
                    notes.map((note) => (
                        <div key={note.id} className="bg-yellow-50 border border-yellow-200 rounded p-3 text-sm">
                            <p className="text-gray-800 mb-2 whitespace-pre-wrap">{note.note}</p>
                            <div className="flex justify-between items-center text-xs text-gray-500 border-t border-yellow-200 pt-2 mt-2">
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-gray-700">{note.author.email}</span>
                                    <span className="bg-gray-100 px-1.5 py-0.5 rounded text-[10px] uppercase">{note.author.role}</span>
                                </div>
                                <span>{new Date(note.created_at).toLocaleString()}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Add Note Form */}
            <form onSubmit={handleSubmit} className="border-t border-gray-100 pt-4">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Add Annotation</label>
                <textarea
                    className="w-full border border-gray-300 rounded p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                    rows={3}
                    placeholder="Enter compliance note, query, or observation..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    disabled={isSubmitting}
                />
                <div className="flex justify-end mt-2">
                    <button
                        type="submit"
                        disabled={isSubmitting || !newNote.trim()}
                        className="bg-gray-900 text-white px-4 py-2 rounded text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors"
                    >
                        {isSubmitting ? "Saving..." : "Attach Note"}
                    </button>
                </div>
            </form>
        </div>
    );
}
