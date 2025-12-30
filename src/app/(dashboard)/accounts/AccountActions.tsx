"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Trash2, Unlock } from "lucide-react";
import Modal from "@/components/ui/Modal";
import { useStatusPopup } from "@/hooks/useStatusPopup";

interface Props {
    id: string;
    status: string;
}

export default function AccountActions({ id, status }: Props) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [action, setAction] = useState<"freeze" | "close" | null>(null);
    const { showError, showSuccess, PopupComponent } = useStatusPopup();

    const handleConfirm = async () => {
        if (!action) return;

        setLoading(true);
        try {
            const res = await fetch(`/api/accounts/${id}/${action}`, { method: "POST" });
            if (!res.ok) throw new Error("Failed");
            router.refresh();
            setAction(null);
            showSuccess(`Account ${action}d successfully`);
        } catch (error) {
            showError("Action failed. Check console or permissions.");
        } finally {
            setLoading(false);
        }
    };

    if (status === "closed") return <span className="text-gray-400 text-xs">Closed</span>;

    return (
        <>
            <div className="flex justify-end gap-2">
                {status === "active" && (
                    <button
                        onClick={() => setAction("freeze")}
                        disabled={loading}
                        className="p-1 text-orange-600 hover:bg-orange-50 rounded"
                        title="Freeze Account"
                    >
                        <Lock size={16} />
                    </button>
                )}

                {status !== "closed" && (
                    <button
                        onClick={() => setAction("close")}
                        disabled={loading}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                        title="Close Account"
                    >
                        <Trash2 size={16} />
                    </button>
                )}
            </div>

            <Modal
                isOpen={!!action}
                onClose={() => setAction(null)}
                title={action === "freeze" ? "Freeze Account" : "Close Account"}
            >
                <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                        Are you sure you want to <strong>{action}</strong> this account?
                        This action will be audited and cannot be easily undone.
                    </p>
                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            onClick={() => setAction(null)}
                            disabled={loading}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleConfirm}
                            disabled={loading}
                            className={`px-4 py-2 text-sm font-medium text-white ${action === 'freeze' ? 'bg-orange-600 hover:bg-orange-700' : 'bg-red-600 hover:bg-red-700'}`}
                        >
                            {loading ? "Processing..." : `Confirm ${action === 'freeze' ? 'Freeze' : 'Close'}`}
                        </button>
                    </div>
                </div>
            </Modal>
            <PopupComponent />
        </>
    );
}
