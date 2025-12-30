"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Select } from "@/components/ui/Select";

interface Props {
    customers: { id: string; full_name: string; email: string }[];
}

export default function AccountForm({ customers }: Props) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const data = {
            customer_id: formData.get("customer_id"),
            account_type: formData.get("account_type"),
        };

        try {
            const res = await fetch("/api/accounts", {
                method: "POST",
                body: JSON.stringify(data),
                headers: { "Content-Type": "application/json" },
            });

            if (!res.ok) {
                const json = await res.json();
                throw new Error(json.error || "Failed to create account");
            }

            router.push("/accounts");
            router.refresh();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white border border-gray-200 p-6">
            {error && <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm border border-red-200">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
                    <select name="customer_id" required className="w-full p-2 border border-gray-300 rounded-none focus:border-blue-500 focus:outline-none bg-white">
                        <option value="">Select a Customer</option>
                        {customers.map(c => (
                            <option key={c.id} value={c.id}>{c.full_name} ({c.email})</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Account Type</label>
                    <Select
                        name="account_type"
                        defaultValue="savings"
                    >
                        <option value="savings">Savings Account</option>
                        <option value="current">Current Account</option>
                        <option value="wallet">Digital Wallet</option>
                        <option value="internal">Internal Account</option>
                    </Select>
                </div>

                <div className="pt-4 flex gap-3">
                    <button disabled={loading} type="submit" className="px-4 py-2 bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 rounded-none">
                        {loading ? "Creating..." : "Create Account"}
                    </button>
                    <button disabled={loading} type="button" onClick={() => router.back()} className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 rounded-none">
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}
