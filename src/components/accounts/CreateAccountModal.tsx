
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Loader2, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";

interface CreateAccountModalProps {
    customerId: string;
}

export default function CreateAccountModal({ customerId }: CreateAccountModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const accountType = formData.get("account_type");

        try {
            const res = await fetch("/api/accounts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    customer_id: customerId,
                    account_type: accountType
                })
            });

            if (!res.ok) {
                const json = await res.json();
                throw new Error(json.error || "Failed to create account");
            }

            setIsOpen(false);
            router.refresh();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) {
        return (
            <Button onClick={() => setIsOpen(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
                <Plus size={16} />
                Open New Account
            </Button>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <Card className="w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
                <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-slate-100">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                        <Wallet className="w-5 h-5 text-blue-600" />
                        New Financial Account
                    </CardTitle>
                    <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <X size={20} />
                    </button>
                </CardHeader>
                <CardContent className="pt-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-md">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="account_type">Account Type</Label>
                            <Select name="account_type" id="account_type" required>
                                <option value="savings">Savings Account (Interest Bearing)</option>
                                <option value="current">Current Account (Business/Frequent)</option>
                                <option value="wallet">Digital Wallet (Zero Balance)</option>
                                <option value="internal">Internal Operating Account</option>
                            </Select>
                            <p className="text-[10px] text-slate-500">
                                New accounts start with a zero balance. Use the Transaction module to fund them.
                            </p>
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" isLoading={loading}>
                                Create Account
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
