"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, FileText, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

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
        <Card className="border-slate-200 shadow-sm max-w-2xl mx-auto">
            <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-6 text-slate-900">
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                        <FileText size={20} />
                    </div>
                    <h2 className="text-lg font-semibold">Record New Transaction</h2>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-700 text-sm border border-red-200 rounded-md flex items-center gap-2">
                        <span className="font-medium">Error:</span> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label>Select Account</Label>
                        <div className="relative">
                            <select
                                name="account_id"
                                required
                                className="w-full p-2.5 bg-white border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none font-medium text-slate-700"
                            >
                                <option value="">-- Choose Account --</option>
                                {accounts.map(a => (
                                    <option key={a.id} value={a.id}>
                                        {a.customer.full_name} • {a.account_type.toUpperCase()} • ₹{Number(a.balance?.balance || 0).toLocaleString()}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label>Transaction Type</Label>
                            <div className="relative">
                                <select
                                    name="txn_type"
                                    required
                                    className="w-full p-2.5 bg-white border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none font-medium text-slate-700"
                                >
                                    <option value="credit">Credit (Deposit)</option>
                                    <option value="debit">Debit (Withdrawal)</option>
                                </select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Amount (₹)</Label>
                            <Input
                                name="amount"
                                type="number"
                                step="0.01"
                                min="0.01"
                                required
                                placeholder="0.00"
                                className="font-mono"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Reference / Description</Label>
                        <Input
                            name="reference"
                            placeholder="e.g. INV-2023-001 or Cash Deposit"
                        />
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => router.back()}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="bg-blue-600 hover:bg-blue-700 min-w-[150px]"
                        >
                            {loading ? <Loader2 size={16} className="animate-spin mr-2" /> : <CheckCircle2 size={16} className="mr-2" />}
                            {loading ? "Processing..." : "Submit Transaction"}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
