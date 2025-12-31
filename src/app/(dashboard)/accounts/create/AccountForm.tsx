"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";

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
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && <div className="p-3 rounded-md bg-red-50 text-red-700 text-sm border border-red-200">{error}</div>}

            <div className="space-y-2">
                <Label htmlFor="customer_id">Select Customer</Label>
                <Select name="customer_id" required defaultValue="">
                    <option value="" disabled>-- Select a Customer --</option>
                    {customers.map(c => (
                        <option key={c.id} value={c.id}>{c.full_name} ({c.email})</option>
                    ))}
                </Select>
            </div>

            <div className="space-y-2">
                <Label htmlFor="account_type">Account Type</Label>
                <Select
                    name="account_type"
                    defaultValue="savings"
                >
                    <option value="savings">Savings Account</option>
                    <option value="current">Current Account</option>
                    <option value="wallet">Digital Wallet</option>
                </Select>
            </div>

            <div className="pt-4 flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => router.back()}>
                    Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Account
                </Button>
            </div>
        </form>
    );
}
