"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import CurrencyInput from "@/components/ui/CurrencyInput";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Plus, X, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useStatusPopup } from "@/hooks/useStatusPopup";

export default function CreateProductForm() {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { showError, showSuccess, PopupComponent } = useStatusPopup();

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        interest_type: "REDUCING_BALANCE",
        min_amount: 10000,
        max_amount: 1000000,
        min_tenure_months: 6,
        max_tenure_months: 60,
        interest_rate_min: 8.5,
        interest_rate_max: 18.0,
    });

    const handleChange = (e: any) => {
        const { name, value, type } = e.target;
        setFormData((prev: any) => ({
            ...prev,
            [name]: type === 'number' ? parseFloat(value) : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch("/api/loans/products", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Failed to create product");
            }

            setIsOpen(false);
            router.refresh();
            showSuccess("Loan Product Created Successfully!");
        } catch (error: any) {
            showError(error.message);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
            >
                <Plus size={16} />
                Create Product
            </button>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
                    <h2 className="text-xl font-bold text-gray-900">New Loan Product</h2>
                    <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-700">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="col-span-2">
                            <Label>Product Name</Label>
                            <Input
                                required
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="e.g. Gold Loan"
                            />
                        </div>

                        <div className="col-span-2">
                            <Label>Description</Label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={2}
                                className="flex min-h-[80px] w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-50 transition-all shadow-sm hover:border-blue-200"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Min Amount (₹)</Label>
                                <CurrencyInput
                                    placeholder="0"
                                    value={formData.min_amount}
                                    onValueChange={val => setFormData({ ...formData, min_amount: val ? parseFloat(val) : 0 })}
                                    className="font-mono"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Max Amount (₹)</Label>
                                <CurrencyInput
                                    placeholder="0"
                                    value={formData.max_amount}
                                    onValueChange={val => setFormData({ ...formData, max_amount: val ? parseFloat(val) : 0 })}
                                    className="font-mono"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <Label>Interest Type</Label>
                            <Select
                                name="interest_type"
                                value={formData.interest_type}
                                onChange={handleChange}
                            >
                                <option value="REDUCING_BALANCE">Reducing Balance</option>
                                <option value="FLAT_RATE">Flat Rate</option>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label className="text-xs text-gray-500">Min Rate (%)</Label>
                                <Input required type="number" step="0.01" name="interest_rate_min" value={formData.interest_rate_min} onChange={handleChange} />
                            </div>
                            <div>
                                <Label className="text-xs text-gray-500">Max Rate (%)</Label>
                                <Input required type="number" step="0.01" name="interest_rate_max" value={formData.interest_rate_max} onChange={handleChange} />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label className="text-xs text-gray-500">Min Tenure (M)</Label>
                                <Input required type="number" name="min_tenure_months" value={formData.min_tenure_months} onChange={handleChange} />
                            </div>
                            <div>
                                <Label className="text-xs text-gray-500">Max Tenure (M)</Label>
                                <Input required type="number" name="max_tenure_months" value={formData.max_tenure_months} onChange={handleChange} />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                        >
                            {loading && <Loader2 size={16} className="animate-spin" />}
                            Create Product
                        </button>
                    </div>
                </form>
            </div>
            <PopupComponent />
        </div>
    );
}
