"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateCustomerPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const data = {
            full_name: formData.get("full_name"),
            email: formData.get("email"),
            phone: formData.get("phone"),
            address: formData.get("address"),
        };

        try {
            const res = await fetch("/api/customers", {
                method: "POST",
                body: JSON.stringify(data),
                headers: { "Content-Type": "application/json" },
            });

            if (!res.ok) {
                const json = await res.json();
                throw new Error(json.error || "Failed to create customer");
            }

            router.push("/customers");
            router.refresh(); // Refresh server components
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-semibold mb-6">Create New Customer</h1>

            <div className="bg-white border border-gray-200 p-6">
                {error && <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm border border-red-200">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input name="full_name" required className="w-full p-2 border border-gray-300 rounded-none focus:border-blue-500 focus:outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input name="email" type="email" required className="w-full p-2 border border-gray-300 rounded-none focus:border-blue-500 focus:outline-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                            <input name="phone" required pattern="\d{10}" title="Phone number must be exactly 10 digits" maxLength={10} className="w-full p-2 border border-gray-300 rounded-none focus:border-blue-500 focus:outline-none" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                        <textarea name="address" required rows={3} className="w-full p-2 border border-gray-300 rounded-none focus:border-blue-500 focus:outline-none" />
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button disabled={loading} type="submit" className="px-4 py-2 bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 rounded-none">
                            {loading ? "Creating..." : "Create Customer"}
                        </button>
                        <button disabled={loading} type="button" onClick={() => router.back()} className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 rounded-none">
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
