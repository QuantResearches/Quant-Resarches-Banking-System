"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";
import Modal from "@/components/ui/Modal";
import { useStatusPopup } from "@/hooks/useStatusPopup";

export default function CreateCostCenterForm() {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({ code: "", name: "", description: "" });
    const router = useRouter();
    const { showError, showSuccess, PopupComponent } = useStatusPopup();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch("/api/cost-centers", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error);
            }

            setIsOpen(false);
            setFormData({ code: "", name: "", description: "" });
            router.refresh();
            showSuccess("Cost Center Created");

        } catch (err: any) {
            showError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium"
            >
                <Plus size={16} /> New Cost Center
            </button>

            <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Create Cost Center">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Code</label>
                        <input
                            required
                            type="text"
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                            placeholder="e.g. IT-001"
                            value={formData.code}
                            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Name</label>
                        <input
                            required
                            type="text"
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                            placeholder="e.g. Technology Department"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                        <textarea
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                            rows={3}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded text-sm">Cancel</button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium disabled:opacity-50"
                        >
                            {loading ? <Loader2 size={16} className="animate-spin" /> : "Create Cost Center"}
                        </button>
                    </div>
                </form>
            </Modal>
            <PopupComponent />
        </>
    );
}
