"use client";

import { useState } from "react";
import { User, Camera, Trash2, Upload } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import ConfirmationModal from "@/components/ui/ConfirmationModal";

interface AvatarUploadProps {
    customerId: string;
    currentAvatar?: string | null;
    fullName: string;
}

import Link from "next/link";
/** removed duplicate ConfirmationModal import */
import StatusPopup from "@/components/ui/StatusPopup";

export default function AvatarUpload({ customerId, currentAvatar, fullName }: AvatarUploadProps) {
    const router = useRouter();
    const [isHovered, setIsHovered] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error' | null, message: string | null }>({ type: null, message: null });
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setStatus({ type: null, message: null });
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch(`/api/customers/${customerId}/avatar`, {
                method: "POST",
                body: formData,
            });

            if (!res.ok) throw new Error("Upload failed");

            // Refresh to show new image
            router.refresh();
            setStatus({ type: 'success', message: 'Profile picture updated.' });
        } catch (error) {
            console.error(error);
            setStatus({ type: 'error', message: 'Failed to upload avatar. Please try again.' });
        } finally {
            setUploading(false);
        }
    };

    const confirmRemove = async () => {
        setShowDeleteConfirm(false);
        try {
            const res = await fetch(`/api/customers/${customerId}/avatar`, {
                method: "DELETE",
            });
            if (!res.ok) throw new Error("Delete failed");
            router.refresh();
            setStatus({ type: 'success', message: 'Profile picture removed.' });
        } catch (error) {
            console.error(error);
            setStatus({ type: 'error', message: 'Failed to remove avatar.' });
        }
    };

    return (
        <div
            className="relative w-24 h-24 rounded-full border-2 border-slate-200 overflow-hidden group cursor-pointer"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {currentAvatar ? (
                <Image
                    src={currentAvatar}
                    alt={fullName}
                    fill
                    className="object-cover"
                />
            ) : (
                <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400">
                    <User className="w-10 h-10" />
                </div>
            )}

            {/* Overlay */}
            {(isHovered || uploading) && (
                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2 transition-opacity">
                    {uploading ? (
                        <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                    ) : (
                        <>
                            <label className="cursor-pointer p-1.5 bg-white/20 rounded-full hover:bg-white/40 transition-colors">
                                <Upload className="w-4 h-4 text-white" />
                                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                            </label>
                            {currentAvatar && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(true); }}
                                    className="p-1.5 bg-red-500/80 rounded-full hover:bg-red-500 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4 text-white" />
                                </button>
                            )}
                        </>
                    )}
                </div>
            )}

            <StatusPopup
                status={status.type}
                message={status.message}
                onClose={() => setStatus({ type: null, message: null })}
            />

            <ConfirmationModal
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={confirmRemove}
                title="Remove Profile Picture"
                message="Are you sure you want to remove this customer's profile picture? This cannot be undone."
                confirmText="Remove"
                isDestructive={true}
            />
        </div>
    );
}
