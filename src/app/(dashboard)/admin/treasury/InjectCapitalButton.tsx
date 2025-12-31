"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Plus, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { Label } from "@/components/ui/Label";
// import { toast } from "sonner"; // If you have toast

export default function InjectCapitalButton() {
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
            source: formData.get("source"),
            reference: formData.get("reference")
        };

        try {
            const res = await fetch("/api/admin/capital/inject", {
                method: "POST",
                body: JSON.stringify(data),
                headers: { "Content-Type": "application/json" }
            });

            if (!res.ok) {
                const json = await res.json();
                throw new Error(json.error || "Failed to inject capital");
            }

            setOpen(false);
            router.refresh();
            // toast.success("Capital Injected Successfully");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 disabled:pointer-events-none disabled:opacity-50 bg-emerald-600 text-white shadow hover:bg-emerald-700 h-9 px-4 py-2">
                    <Plus className="h-4 w-4 mr-2" />
                    Inject Capital
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Inject Capital (Equity)</DialogTitle>
                    <DialogDescription>
                        Add funds to the Bank Capital account from external sources (Investors, Shareholders).
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    {error && <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">{error}</div>}

                    <div className="space-y-2">
                        <Label htmlFor="amount">Amount (INR)</Label>
                        <Label htmlFor="amount">Amount (INR)</Label>
                        <CurrencyInput
                            id="amount"
                            name="amount"
                            placeholder="e.g. 1,00,00,000"
                            value={amount}
                            onValueChange={(val) => setAmount(val)}
                            className="bg-white"
                            required
                        />
                        {/* Hidden input for form submission if needed, or handle in handleSubmit */}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="source">Source of Funds</Label>
                        <Input
                            id="source"
                            name="source"
                            placeholder="e.g. Series A Funding"
                            required
                            className="bg-white"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="reference">Reference ID</Label>
                        <Input
                            id="reference"
                            name="reference"
                            placeholder="e.g. WIRE-2025-001"
                            className="bg-white"
                        />
                    </div>

                    <DialogFooter>
                        <Button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Confirm Injection
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
