"use client";

import { useEffect, useState } from "react";
import { CheckCircle, XCircle, X } from "lucide-react";
import { createPortal } from "react-dom";

type StatusType = "success" | "error" | null;

interface StatusPopupProps {
    status: StatusType;
    message: string | null;
    onClose: () => void;
}

export default function StatusPopup({ status, message, onClose }: StatusPopupProps) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (status) {
            setVisible(true);
            // Auto close success after 3 seconds
            if (status === "success") {
                const timer = setTimeout(() => {
                    setVisible(false);
                    setTimeout(onClose, 300); // Wait for animation
                }, 3000);
                return () => clearTimeout(timer);
            }
        } else {
            setVisible(false);
        }
    }, [status, onClose]);

    if (!status && !visible) return null;

    // Portal to mount outside of normal DOM flow (optional, but good for z-index)
    // For simplicity here, we'll return inline but fixed position.

    return (
        <div className={`fixed bottom-6 right-6 z-50 transition-all duration-300 transform ${visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}>
            <div className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border ${status === "success"
                    ? "bg-green-50 border-green-200 text-green-800"
                    : "bg-red-50 border-red-200 text-red-800"
                }`}>
                {status === "success" ? <CheckCircle size={20} /> : <XCircle size={20} />}
                <div className="flex-1 text-sm font-medium pr-2">
                    {message}
                </div>
                <button onClick={() => { setVisible(false); setTimeout(onClose, 300); }} className="hover:opacity-70">
                    <X size={16} />
                </button>
            </div>
        </div>
    );
}
