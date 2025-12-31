"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft, Wallet } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/Card";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { Select } from "@/components/ui/Select";
import { useStatusPopup } from "@/hooks/useStatusPopup";

export default function CreateLoanPage() {
    const router = useRouter();
    const [customers, setCustomers] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const { showError, showSuccess, PopupComponent } = useStatusPopup();

    const [formData, setFormData] = useState({
        customer_id: "",
        product_id: "",
        amount: "",
        tenure_months: ""
    });

    useEffect(() => {
        Promise.all([
            fetch("/api/customers").then(r => r.json()),
            fetch("/api/loans/products").then(r => r.json())
        ]).then(([custData, prodData]) => {
            setCustomers(custData || []);
            setProducts(prodData || []);
            setLoading(false);
        });
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await fetch("/api/loans/apply", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    customer_id: formData.customer_id,
                    product_id: formData.product_id,
                    amount: Number(formData.amount),
                    tenure_months: Number(formData.tenure_months)
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            router.push(`/admin/loans/${data.id}`);
        } catch (err: any) {
            showError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="p-8"><Loader2 className="animate-spin" /></div>;

    const selectedProduct = products.find(p => p.id === formData.product_id);

    return (
        <div className="max-w-3xl mx-auto space-y-6 pb-12">
            <div className="flex items-center gap-4">
                <Link href="/admin/loans" className="text-slate-500 hover:text-slate-900 transition-colors">
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">New Loan Application</h1>
                    <p className="text-sm text-slate-500">Originate a new loan for a verified customer.</p>
                </div>
            </div>

            <Card className="border-slate-200 shadow-sm">
                <CardContent className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Customer Selection */}
                        <div className="space-y-2">
                            <Label>Select Customer</Label>
                            <div className="relative">
                                <Select
                                    required
                                    value={formData.customer_id}
                                    onChange={e => setFormData({ ...formData, customer_id: e.target.value })}
                                >
                                    <option value="">-- Choose Customer --</option>
                                    {customers.map(c => (
                                        <option key={c.id} value={c.id}>{c.full_name} ({c.email})</option>
                                    ))}
                                </Select>
                            </div>
                        </div>

                        {/* Product Selection */}
                        <div className="space-y-2">
                            <Label>Loan Product</Label>
                            {products.length === 0 ? (
                                <div className="p-4 bg-amber-50 border border-amber-200 rounded-md text-amber-800 text-sm flex items-center justify-between">
                                    <span>No active loan products found in the system.</span>
                                    {/* In a real app, this would be an admin action. For now, we show a message or manual fix */}
                                    <span className="font-semibold">Please run database seed.</span>
                                </div>
                            ) : (
                                <Select
                                    required
                                    value={formData.product_id}
                                    onChange={e => setFormData({ ...formData, product_id: e.target.value })}
                                >
                                    <option value="">-- Select Loan Product --</option>
                                    {products.map(p => (
                                        <option key={p.id} value={p.id}>
                                            {p.name} ({Number(p.interest_rate_min)}% - {Number(p.interest_rate_max)}%)
                                        </option>
                                    ))}
                                </Select>
                            )}
                        </div>

                        {/* Product Details Card */}
                        {selectedProduct && (
                            <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-lg space-y-3">
                                <div className="flex items-center gap-2 text-blue-700 font-medium">
                                    <Wallet size={16} />
                                    <span>{selectedProduct.name} Terms</span>
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div className="bg-white p-3 rounded border border-blue-100/50">
                                        <span className="block text-slate-500 text-xs uppercase tracking-wider mb-1">Eligible Amount</span>
                                        <span className="font-mono font-medium text-slate-900">
                                            ₹{Number(selectedProduct.min_amount).toLocaleString()} - ₹{Number(selectedProduct.max_amount).toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="bg-white p-3 rounded border border-blue-100/50">
                                        <span className="block text-slate-500 text-xs uppercase tracking-wider mb-1">Tenure Range</span>
                                        <span className="font-mono font-medium text-slate-900">
                                            {selectedProduct.min_tenure_months} - {selectedProduct.max_tenure_months} Months
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label>Requested Amount (₹)</Label>
                                <CurrencyInput
                                    required
                                    min={selectedProduct ? Number(selectedProduct.min_amount) : 0}
                                    max={selectedProduct ? Number(selectedProduct.max_amount) : undefined}
                                    className="font-mono"
                                    placeholder="0.00"
                                    value={formData.amount}
                                    onValueChange={val => setFormData({ ...formData, amount: val })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Tenure (Months)</Label>
                                <Input
                                    type="number"
                                    required
                                    min={selectedProduct?.min_tenure_months}
                                    max={selectedProduct?.max_tenure_months}
                                    className="font-mono"
                                    placeholder="e.g. 24"
                                    value={formData.tenure_months}
                                    onChange={e => setFormData({ ...formData, tenure_months: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="pt-6 flex justify-end gap-3">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => router.back()}
                                disabled={submitting}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={submitting || !selectedProduct}
                                className="bg-blue-600 hover:bg-blue-700 min-w-[150px]"
                            >
                                {submitting ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
                                {submitting ? "Processing..." : "Submit Application"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
            <PopupComponent />
        </div>
    );
}
