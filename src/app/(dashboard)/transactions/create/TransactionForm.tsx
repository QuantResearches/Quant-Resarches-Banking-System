"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, FileText, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { useStatusPopup } from "@/hooks/useStatusPopup";

interface Props {
    accounts: any[];
}

export default function TransactionForm({ accounts }: Props) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [amount, setAmount] = useState("");
    const { showSuccess, showError, PopupComponent } = useStatusPopup();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const data = {
            account_id: formData.get("account_id"),
            txn_type: formData.get("txn_type"),
            amount: parseFloat(formData.get("amount") as string),
            reference: formData.get("reference"),
            description: (formData.get("reference") as string) || "", // Use reference as description since UI combines them
        };

        try {
            const res = await fetch("/api/transactions", {
                method: "POST",
                body: JSON.stringify(data),
                headers: { "Content-Type": "application/json" },
            });

            const json = await res.json();

            if (!res.ok) {
                if (res.status === 402 || res.status === 403) {
                    showSuccess("Transaction submitted for approval.");
                    router.push("/approvals?status=pending");
                    return;
                }
                const errorMessage = typeof json.error === 'string'
                    ? json.error
                    : JSON.stringify(json.error || "Transaction failed");
                throw new Error(errorMessage);
            }

            showSuccess("Transaction Recorded Successfully");
            router.refresh();
            router.push("/transactions");

        } catch (err: any) {
            showError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        Record New Transaction
                    </h2>
                    <p className="text-sm text-gray-500">Enter transaction details below.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="account_id">Select Account</Label>
                        <select
                            name="account_id"
                            id="account_id"
                            required
                            className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <option value="">-- Select Account --</option>
                            {accounts.map((acc) => (
                                <option key={acc.id} value={acc.id}>
                                    {acc.customer.full_name} • {acc.account_type.toUpperCase()} • ₹{acc.balance.balance}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="txn_type">Transaction Type</Label>
                        <select
                            name="txn_type"
                            id="txn_type"
                            required
                            className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <option value="credit">Credit (Deposit)</option>
                            <option value="debit">Debit (Withdrawal)</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="amount">Amount (₹)</Label>
                        <CurrencyInput
                            name="amount_display"
                            id="amount_input"
                            placeholder="0.00"
                            required
                            value={amount}
                            onValueChange={setAmount}
                        />
                        <input type="hidden" name="amount" id="amount" value={amount} required />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="reference">Reference / Description</Label>
                        <Input
                            type="text"
                            name="reference"
                            id="reference"
                            placeholder="e.g. INV-2023-001 or Cash Deposit"
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="outline" onClick={() => router.back()}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Submit Transaction
                    </Button>
                </div>
            </form>
            <PopupComponent />
        </>
    );
}
