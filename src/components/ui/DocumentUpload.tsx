"use client";

import { useState } from "react";
import { UploadCloud, CheckCircle, AlertCircle } from "lucide-react";

interface DocumentUploadProps {
    type: "KYC" | "EVIDENCE";
    entityId: string;
    onUploadComplete?: (key: string) => void;
}

export default function DocumentUpload({ type, entityId, onUploadComplete }: DocumentUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setError(null);
        setSuccess(false);

        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", type);
        formData.append("entityId", entityId);

        try {
            const res = await fetch("/api/documents/upload", {
                method: "POST",
                body: formData
            });

            if (!res.ok) throw new Error("Upload failed");

            const data = await res.json();
            setSuccess(true);
            if (onUploadComplete) onUploadComplete(data.key);
        } catch (err) {
            setError("Failed to upload document");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="border border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors bg-white">
            <input
                type="file"
                id={`upload-${entityId}`}
                className="hidden"
                onChange={handleFileChange}
                disabled={uploading || success}
            />

            <label htmlFor={`upload-${entityId}`} className="cursor-pointer block">
                {uploading ? (
                    <div className="flex flex-col items-center text-blue-600">
                        <UploadCloud className="animate-bounce w-8 h-8 mb-2" />
                        <span className="text-sm font-medium">Securely Uploading...</span>
                    </div>
                ) : success ? (
                    <div className="flex flex-col items-center text-green-600">
                        <CheckCircle className="w-8 h-8 mb-2" />
                        <span className="text-sm font-medium">Uploaded Successfully</span>
                    </div>
                ) : (
                    <div className="flex flex-col items-center text-gray-500">
                        <UploadCloud className="w-8 h-8 mb-2" />
                        <span className="text-sm font-medium">Click to Upload Document</span>
                        <span className="text-xs text-gray-400 mt-1">PDF, JPG, PNG (Max 5MB)</span>
                    </div>
                )}
            </label>

            {error && (
                <div className="mt-2 text-xs text-red-600 flex items-center justify-center gap-1">
                    <AlertCircle size={12} /> {error}
                </div>
            )}
        </div>
    );
}
