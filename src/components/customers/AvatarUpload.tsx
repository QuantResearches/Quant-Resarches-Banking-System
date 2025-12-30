"use client";

import { useState } from "react";
import { User, Camera, Trash2, Upload } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface AvatarUploadProps {
    customerId: string;
    currentAvatar?: string | null;
    fullName: string;
}

export default function AvatarUpload({ customerId, currentAvatar, fullName }: AvatarUploadProps) {
    const router = useRouter();
    const [isHovered, setIsHovered] = useState(false);
    const [uploading, setUploading] = useState(false);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
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
        } catch (error) {
            console.error(error);
            alert("Failed to upload avatar");
        } finally {
            setUploading(false);
        }
    };

    const handleRemove = async () => {
        if (!confirm("Are you sure you want to remove the profile picture?")) return;

        try {
            const res = await fetch(`/api/customers/${customerId}/avatar`, {
                method: "DELETE",
            });
            if (!res.ok) throw new Error("Delete failed");
            router.refresh();
        } catch (error) {
            console.error(error);
            alert("Failed to remove avatar");
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
                                    onClick={(e) => { e.stopPropagation(); handleRemove(); }}
                                    className="p-1.5 bg-red-500/80 rounded-full hover:bg-red-500 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4 text-white" />
                                </button>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
