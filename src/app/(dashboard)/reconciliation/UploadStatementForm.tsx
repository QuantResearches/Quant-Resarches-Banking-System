
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";

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
        <Card className="border-slate-200 shadow-sm">
            <CardHeader>
                <CardTitle>Upload Bank Statement</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleUpload} className="space-y-4">
                    <div className="space-y-2">
                        <Label>Select CSV File</Label>
                        <input
                            type="file"
                            accept=".csv"
                            onChange={handleFileChange}
                            className="block w-full text-sm text-slate-500
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-full file:border-0
                            file:text-xs file:font-semibold
                            file:bg-blue-50 file:text-blue-700
                            hover:file:bg-blue-100 cursor-pointer"
                        />
                        <p className="text-xs text-slate-500">Format: Date, Description, Amount, Reference</p>
                    </div>

                    {message && (
                        <div className={`p-3 rounded text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                            {message.text}
                        </div>
                    )}

                    <Button
                        type="submit"
                        disabled={!file || uploading}
                        className="w-full"
                    >
                        {uploading ? "Processing..." : "Upload Statement"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
