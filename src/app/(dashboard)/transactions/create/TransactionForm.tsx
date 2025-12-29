"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
    accounts: any[];
}

export default function TransactionForm({ accounts }: Props) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const data = {
            account_id: formData.get("account_id"),
            txn_type: formData.get("txn_type"),
            amount: Number(formData.get("amount")),
            reference: formData.get("reference"),
        };

        try {
            const res = await fetch("/api/transactions", {
                method: "POST",
                body: JSON.stringify(data),
                headers: { "Content-Type": "application/json" },
            });

            if (!res.ok) {
                const json = await res.json();
                throw new Error(json.error || "Failed to record transaction");
            }

            const json = await res.json();

            if (json.status === "pending_approval") {
                alert("Transaction exceeds your limit. It has been submitted for approval.");
            }

            router.push("/transactions");
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Account</label>
                    <select name="account_id" required className="w-full p-2 border border-gray-300 rounded-none focus:border-blue-500 focus:outline-none bg-white font-mono text-sm">
                        <option value="">Select an Account</option>
                        {accounts.map(a => (
                            <option key={a.id} value={a.id}>
                                {a.customer.full_name} | {a.account_type} | Bal: {Number(a.balance?.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                        <select name="txn_type" required className="w-full p-2 border border-gray-300 rounded-none focus:border-blue-500 focus:outline-none bg-white">
                            <option value="credit">Credit (Deposit)</option>
                            <option value="debit">Debit (Withdrawal)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                        <input name="amount" type="number" step="0.01" min="0.01" required className="w-full p-2 border border-gray-300 rounded-none focus:border-blue-500 focus:outline-none" />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reference</label>
                    <input name="reference" className="w-full p-2 border border-gray-300 rounded-none focus:border-blue-500 focus:outline-none" placeholder="e.g. INV-12345" />
                </div>

                <div className="pt-4 flex gap-3">
                    <button disabled={loading} type="submit" className="px-4 py-2 bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 rounded-none">
                        {loading ? "Processing..." : "Submit Transaction"}
                    </button>
                    <button disabled={loading} type="button" onClick={() => router.back()} className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 rounded-none">
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}
