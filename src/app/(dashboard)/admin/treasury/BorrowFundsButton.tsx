"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Download, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { CurrencyInput } from "@/components/ui/CurrencyInput";

export default function BorrowFundsButton() {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [amount, setAmount] = useState("");

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const data = {
            amount: Number(amount),
            lender_name: formData.get("lender_name"),
            interest_rate: formData.get("interest_rate"),
            tenure_months: formData.get("tenure_months"),
            reference: formData.get("reference")
        };

        try {
            const res = await fetch("/api/admin/treasury/borrow", {
                method: "POST",
                body: JSON.stringify(data),
                headers: { "Content-Type": "application/json" }
            });

            if (!res.ok) {
                const json = await res.json();
                throw new Error(json.error || "Failed to borrow funds");
            }

            setOpen(false);
            setAmount("");
            router.refresh();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 disabled:pointer-events-none disabled:opacity-50 bg-amber-600 text-white shadow hover:bg-amber-700 h-9 px-4 py-2">
                    <Download className="h-4 w-4 mr-2" />
                    Borrow Funds
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Borrow Funds (Liability)</DialogTitle>
                    <DialogDescription>
                        Record a new wholesale loan taken by the bank.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    {error && <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">{error}</div>}

                    <div className="space-y-2">
                        <Label htmlFor="lender_name">Lender Name</Label>
                        <Input
                            id="lender_name"
                            name="lender_name"
                            placeholder="e.g. RBI, Interbank Market"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="amount">Principal Amount (INR)</Label>
                        <CurrencyInput
                            id="amount"
                            name="amount"
                            placeholder="e.g. 5,00,00,000"
                            value={amount}
                            onValueChange={setAmount}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="interest_rate">Rate (% p.a)</Label>
                            <Input
                                id="interest_rate"
                                name="interest_rate"
                                type="number"
                                step="0.01"
                                placeholder="6.5"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="tenure_months">Tenure (Months)</Label>
                            <Input
                                id="tenure_months"
                                name="tenure_months"
                                type="number"
                                placeholder="12"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="reference">Reference ID</Label>
                        <Input
                            id="reference"
                            name="reference"
                            placeholder="Optional ref no."
                        />
                    </div>

                    <DialogFooter>
                        <Button type="submit" disabled={loading} className="w-full bg-amber-600 hover:bg-amber-700 text-white">
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Confirm Borrowing
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
