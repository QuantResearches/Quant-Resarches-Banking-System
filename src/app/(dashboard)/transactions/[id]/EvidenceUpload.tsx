
"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Upload, Loader2 } from "lucide-react";

import StatusPopup from "@/components/ui/StatusPopup";

export default function EvidenceUpload({ transactionId }: { transactionId: string }) {
    const [uploading, setUploading] = useState(false);
    const [status, setStatus] = useState<"success" | "error" | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [documentType, setDocumentType] = useState("general");
    const inputFileRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!inputFileRef.current?.files?.length) {
            setStatus("error");
            setMessage("Please select a file to upload.");
            return;
        }

        const file = inputFileRef.current.files[0];
        setUploading(true);
        setStatus(null);

        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("documentType", documentType);

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

            setStatus("success");
            setMessage("File uploaded successfully. Refreshing...");

            setTimeout(() => {
                router.refresh();
            }, 1000);

        } catch (error: any) {
            setStatus("error");
            setMessage(error.message || "An unexpected error occurred.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <>
            <form onSubmit={handleUpload} className="flex flex-col gap-4 w-full">
                <div className="flex gap-4 items-center">
                    <select
                        required
                        className="bg-white border border-slate-300 text-slate-700 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block p-2.5 outline-none"
                        value={documentType}
                        onChange={(e) => setDocumentType(e.target.value)}
                    >
                        <option value="general">General Attachment</option>
                        <option value="cheque">Cheque</option>
                        <option value="invoice">Invoice</option>
                        <option value="contract">Contract / Agreement</option>
                        <option value="id_proof">ID Proof</option>
                        <option value="memo">Internal Memo</option>
                    </select>

                    <div className="relative flex-1">
                        <input
                            ref={inputFileRef}
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                            required
                            className="block w-full text-sm text-slate-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-full file:border-0
                                file:text-xs file:font-semibold
                                file:bg-slate-900 file:text-white
                                hover:file:bg-slate-700
                                border border-slate-200 rounded-full
                            "
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={uploading}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 min-w-[100px] justify-center"
                    >
                        {uploading ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />}
                        Upload
                    </button>
                </div>
            </form>
            <StatusPopup
                status={status}
                message={message}
                onClose={() => setStatus(null)}
            />
        </>
    );
}
