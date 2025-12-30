"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft, Upload, Eye, CheckCircle, XCircle, FileText } from "lucide-react";
import Link from "next/link";

import ConfirmationModal from "@/components/ui/ConfirmationModal";
import { useStatusPopup } from "@/hooks/useStatusPopup";

export default function KYCDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const [id, setId] = useState<string | null>(null);
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [reviewAction, setReviewAction] = useState<"APPROVE" | "REJECT" | null>(null);
    const router = useRouter();
    const { showError, showSuccess, PopupComponent } = useStatusPopup();

    // Form Stats
    const [selectedType, setSelectedType] = useState("AADHAAR_MASKED");
    const [docNumber, setDocNumber] = useState("");
    const [file, setFile] = useState<File | null>(null);

    useEffect(() => {
        params.then(p => {
            setId(p.id);
            fetchProfile(p.id);
        });
    }, [params]);

    const fetchProfile = async (customerId: string) => {
        try {
            // First check if profile exists, if not, try to init? 
            // The dashboard only links if profile exists (mostly).
            // But if we came from URL manually...
            const res = await fetch(`/api/kyc/profile?customer_id=${customerId}`);
            const data = await res.json();

            if (data.message === "No Profile Found") {
                // Auto-init for Admin convenience?
                const init = await fetch("/api/kyc/profile", {
                    method: "POST",
                    body: JSON.stringify({ customer_id: customerId })
                });
                const newData = await init.json();
                setProfile(newData);
            } else {
                setProfile(data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file || !profile) return;
        setUploading(true);

        try {
            // 1. Upload to S3 (Mock)
            const formData = new FormData();
            formData.append("file", file);

            const uploadRes = await fetch("/api/kyc/upload", {
                method: "POST",
                body: formData
            });
            const uploadData = await uploadRes.json();
            if (!uploadRes.ok) throw new Error(uploadData.error);

            // 2. Save Metadata
            const metaRes = await fetch("/api/kyc/documents", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    profile_id: profile.id,
                    type: selectedType,
                    s3_key: uploadData.key,
                    document_number: docNumber
                })
            });
            if (!metaRes.ok) throw new Error("Metadata Save Failed");

            showSuccess("Document Uploaded!");
            setFile(null);
            setDocNumber("");

            // Refresh
            if (id) fetchProfile(id);

        } catch (err: any) {
            showError(err.message);
        } finally {
            setUploading(false);
        }
    };

    const handleReviewConfirm = async () => {
        if (!reviewAction) return;

        try {
            const res = await fetch("/api/kyc/review", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    profile_id: profile.id,
                    action: reviewAction
                })
            });
            if (!res.ok) throw new Error("Review Failed");
            if (id) fetchProfile(id);
        } catch (e) {
            showError("Error processing review");
        } finally {
            setReviewAction(null);
        }
    };

    if (loading) return <div className="p-8"><Loader2 className="animate-spin" /></div>;
    if (!profile) return <div className="p-8">Profile failed to load.</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/kyc" className="text-gray-500 hover:text-gray-900">
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">KYC Verification</h1>
                    <p className="text-sm text-gray-500">ID: {profile.id}</p>
                </div>
                <div className="ml-auto">
                    <span className="bg-gray-100 px-3 py-1 rounded-full text-sm font-bold">{profile.kyc_status}</span>
                </div>
            </div>

            {/* Document Vault */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <FileText className="text-blue-600" />
                    Document Vault
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* List Existing */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium text-gray-500 uppercase">Uploaded Documents</h3>
                        {profile.documents && profile.documents.length > 0 ? (
                            <ul className="space-y-3">
                                {profile.documents.map((doc: any) => (
                                    <li key={doc.id} className="flex justify-between items-center p-3 bg-gray-50 rounded border">
                                        <div>
                                            <p className="font-medium text-sm">{doc.type}</p>
                                            <p className="text-xs text-mono text-gray-500">{doc.document_number}</p>
                                            <p className="text-xs text-gray-400">{new Date(doc.uploaded_at).toLocaleDateString()}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {doc.is_verified && <CheckCircle size={16} className="text-green-500" />}
                                            <a
                                                href={`/api/kyc/document/${doc.s3_key}`}
                                                target="_blank"
                                                className="p-2 hover:bg-gray-200 rounded text-blue-600"
                                            >
                                                <Eye size={18} />
                                            </a>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-gray-400 italic">No documents uploaded.</p>
                        )}
                    </div>

                    {/* Upload Form */}
                    <div className="bg-blue-50 p-4 rounded border border-blue-100">
                        <h3 className="text-sm font-medium text-blue-800 uppercase mb-4">Upload New Proof</h3>
                        <form onSubmit={handleUpload} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Doc Type</label>
                                <select
                                    className="w-full p-2 text-sm border rounded"
                                    value={selectedType}
                                    onChange={e => setSelectedType(e.target.value)}
                                >
                                    <option value="AADHAAR_MASKED">Aadhaar (Masked)</option>
                                    <option value="PAN">PAN Card</option>
                                    <option value="PASSPORT">Passport</option>
                                    <option value="VOTER_ID">Voter ID</option>
                                    <option value="PHOTO">Customer Photo</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">ID Number (Optional)</label>
                                <input
                                    type="text"
                                    className="w-full p-2 text-sm border rounded"
                                    placeholder="XXXX-XXXX-1234"
                                    value={docNumber}
                                    onChange={e => setDocNumber(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">File</label>
                                <input
                                    type="file"
                                    className="w-full text-sm"
                                    onChange={e => setFile(e.target.files?.[0] || null)}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={uploading || !file}
                                className="w-full bg-blue-600 text-white py-2 rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex justify-center gap-2"
                            >
                                {uploading ? "Securing Upload..." : "Secure Upload"}
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Action Bar */}
            <div className="flex justify-end gap-4 pt-4 border-t">
                <button
                    onClick={() => setReviewAction("REJECT")}
                    className="flex items-center gap-2 px-6 py-2 border border-red-300 text-red-700 rounded hover:bg-red-50 font-medium"
                >
                    <XCircle size={18} />
                    Reject KYC
                </button>
                <button
                    onClick={() => setReviewAction("APPROVE")}
                    className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-medium"
                >
                    <CheckCircle size={18} />
                    Verify & Approve
                </button>
            </div>

            <ConfirmationModal
                isOpen={!!reviewAction}
                onClose={() => setReviewAction(null)}
                onConfirm={handleReviewConfirm}
                title={reviewAction === "APPROVE" ? "Approve KYC Verification?" : "Reject KYC Verification?"}
                message={reviewAction === "APPROVE"
                    ? "This will mark the customer as verified and allow them to access banking features."
                    : "This will reject the customer's KYC application. They will need to re-submit documents."}
                confirmText={reviewAction === "APPROVE" ? "Verify & Approve" : "Reject Application"}
                isDestructive={reviewAction === "REJECT"}
            />
            <PopupComponent />
        </div>
    );
}
