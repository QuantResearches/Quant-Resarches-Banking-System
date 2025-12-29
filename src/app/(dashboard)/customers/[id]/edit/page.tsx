"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";

export default function EditCustomerPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [customer, setCustomer] = useState<any>(null);

    useEffect(() => {
        fetch(`/api/customers/${id}`)
            .then(res => {
                if (!res.ok) throw new Error("Failed to load customer");
                return res.json();
            })
            .then(data => {
                setCustomer(data);
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    }, [id]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const data = {
            full_name: formData.get("full_name"),
            email: formData.get("email"),
            phone: formData.get("phone"),
            address: formData.get("address"),
            status: formData.get("status"),
        };

        try {
            const res = await fetch(`/api/customers/${id}`, {
                method: "PATCH",
                body: JSON.stringify(data),
                headers: { "Content-Type": "application/json" },
            });

            if (!res.ok) {
                const json = await res.json();
                throw new Error(json.error || "Failed to update customer");
            }

            router.push("/customers");
            router.refresh();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-6">Loading...</div>;
    if (error) return <div className="p-6 text-red-600">Error: {error}</div>;
    if (!customer) return <div className="p-6">Customer not found</div>;

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-semibold mb-6">Edit Customer</h1>

            <div className="bg-white border border-gray-200 p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input
                            name="full_name"
                            defaultValue={customer.full_name}
                            required
                            className="w-full p-2 border border-gray-300 rounded-none focus:border-blue-500 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            name="email"
                            type="email"
                            defaultValue={customer.email}
                            required
                            className="w-full p-2 border border-gray-300 rounded-none focus:border-blue-500 focus:outline-none"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                            <input
                                name="phone"
                                defaultValue={customer.phone}
                                required
                                pattern="\d{10}"
                                title="Phone number must be exactly 10 digits"
                                maxLength={10}
                                className="w-full p-2 border border-gray-300 rounded-none focus:border-blue-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select
                                name="status"
                                defaultValue={customer.status}
                                className="w-full p-2 border border-gray-300 rounded-none focus:border-blue-500 focus:outline-none bg-white"
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                                <option value="restricted">Restricted</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                        <textarea
                            name="address"
                            defaultValue={customer.address}
                            rows={3}
                            required
                            className="w-full p-2 border border-gray-300 rounded-none focus:border-blue-500 focus:outline-none"
                        />
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button disabled={saving} type="submit" className="px-4 py-2 bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 rounded-none">
                            {saving ? "Saving..." : "Save Changes"}
                        </button>
                        <button disabled={saving} type="button" onClick={() => router.back()} className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 rounded-none">
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
