
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CreateLoanPage() {
    const router = useRouter();
    const [customers, setCustomers] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

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
            alert(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="p-8"><Loader2 className="animate-spin" /></div>;

    const selectedProduct = products.find(p => p.id === formData.product_id);

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/loans" className="text-gray-500 hover:text-gray-900">
                    <ArrowLeft size={20} />
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">New Loan Application</h1>
            </div>

            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
                    <select
                        required
                        className="w-full p-2 border rounded"
                        value={formData.customer_id}
                        onChange={e => setFormData({ ...formData, customer_id: e.target.value })}
                    >
                        <option value="">Select Customer</option>
                        {customers.map(c => (
                            <option key={c.id} value={c.id}>{c.full_name} ({c.email})</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Loan Product</label>
                    <select
                        required
                        className="w-full p-2 border rounded"
                        value={formData.product_id}
                        onChange={e => setFormData({ ...formData, product_id: e.target.value })}
                    >
                        <option value="">Select Product</option>
                        {products.map(p => (
                            <option key={p.id} value={p.id}>{p.name} ({p.interest_rate_min}% - {p.interest_rate_max}%)</option>
                        ))}
                    </select>
                </div>

                {selectedProduct && (
                    <div className="p-3 bg-blue-50 text-blue-800 text-sm rounded">
                        Limits: {Number(selectedProduct.min_amount)} - {Number(selectedProduct.max_amount)} Amount | {selectedProduct.min_tenure_months} - {selectedProduct.max_tenure_months} Months
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                        <input
                            type="number"
                            required
                            className="w-full p-2 border rounded"
                            value={formData.amount}
                            onChange={e => setFormData({ ...formData, amount: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tenure (Months)</label>
                        <input
                            type="number"
                            required
                            className="w-full p-2 border rounded"
                            value={formData.tenure_months}
                            onChange={e => setFormData({ ...formData, tenure_months: e.target.value })}
                        />
                    </div>
                </div>

                <div className="pt-4 border-t flex justify-end">
                    <button
                        type="submit"
                        disabled={submitting}
                        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50 font-medium flex items-center gap-2"
                    >
                        {submitting && <Loader2 size={16} className="animate-spin" />}
                        Submit Application
                    </button>
                </div>
            </form>
        </div>
    );
}
