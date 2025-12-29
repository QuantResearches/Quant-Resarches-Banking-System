
"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Upload, Loader2 } from "lucide-react";

export default function EvidenceUpload({ transactionId }: { transactionId: string }) {
    const [uploading, setUploading] = useState(false);
    const inputFileRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!inputFileRef.current?.files?.length) {
            alert("Please select a file.");
            return;
        }

        const file = inputFileRef.current.files[0];
        setUploading(true);

        try {
            const formData = new FormData();
            formData.append("file", file);

            const res = await fetch(`/api/transactions/${transactionId}/evidence`, {
                method: "POST",
                body: formData
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Upload failed");
            }

            // Reset
            if (inputFileRef.current) inputFileRef.current.value = "";
            router.refresh();
            alert("File Uploaded Successfully!");

        } catch (error: any) {
            alert("Error: " + error.message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <form onSubmit={handleUpload} className="flex items-center gap-4">
            <input
                ref={inputFileRef}
                type="file"
                accept="application/pdf,image/*"
                className="block w-full text-sm text-slate-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-xs file:font-semibold
                    file:bg-slate-900 file:text-white
                    hover:file:bg-slate-700
                "
            />
            <button
                type="submit"
                disabled={uploading}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
                {uploading ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />}
                Upload
            </button>
        </form>
    );
}
