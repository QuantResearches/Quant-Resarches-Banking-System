"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";
import Modal from "@/components/ui/Modal";
import { useStatusPopup } from "@/hooks/useStatusPopup";

import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";

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
            <Button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2"
            >
                <Plus size={16} /> New Cost Center
            </Button>

            <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Create Cost Center">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label>Code</Label>
                        <Input
                            required
                            type="text"
                            placeholder="e.g. IT-001"
                            value={formData.code}
                            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Name</Label>
                        <Input
                            required
                            type="text"
                            placeholder="e.g. Technology Department"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Description</Label>
                        <textarea
                            className="flex min-h-[80px] w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-50 transition-all shadow-sm hover:border-blue-200"
                            rows={3}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
                        <Button
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? <Loader2 size={16} className="animate-spin mr-2" /> : <Plus size={16} className="mr-2" />}
                            Create Cost Center
                        </Button>
                    </div>
                </form>
            </Modal>
            <PopupComponent />
        </>
    );
}
