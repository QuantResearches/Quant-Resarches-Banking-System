
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function UploadStatementForm() {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const router = useRouter();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setMessage(null);
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return;

        setUploading(true);
        setMessage(null);

        const reader = new FileReader();
        reader.onload = async (event) => {
            const csvContent = event.target?.result as string;

            try {
                const res = await fetch("/api/reconciliation/upload", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        filename: file.name,
                        csvContent
                    })
                });

                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.error || "Upload failed");
                }

                setMessage({ type: 'success', text: `Uploaded successfully! ${data.count} lines processed.` });
                setFile(null);
                // Reset file input if possible, or just let refresh handle it via UI state
                router.refresh();
            } catch (err: any) {
                setMessage({ type: 'error', text: err.message });
            } finally {
                setUploading(false);
            }
        };

        reader.readAsText(file);
    };

    return (
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h2 className="text-lg font-semibold mb-4 text-slate-900">Upload Bank Statement</h2>
            <form onSubmit={handleUpload} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Select CSV File</label>
                    <input
                        type="file"
                        accept=".csv"
                        onChange={handleFileChange}
                        className="block w-full text-sm text-gray-500
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-md file:border-0
                            file:text-sm file:font-semibold
                            file:bg-indigo-50 file:text-indigo-700
                            hover:file:bg-indigo-100"
                    />
                    <p className="mt-1 text-xs text-gray-500">Format: Date, Description, Amount, Reference</p>
                </div>

                {message && (
                    <div className={`p-3 rounded text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {message.text}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={!file || uploading}
                    className="w-full bg-slate-900 text-white py-2 px-4 rounded-md font-medium hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {uploading ? "Processing..." : "Upload Statement"}
                </button>
            </form>
        </div>
    );
}
