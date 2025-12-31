"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Banknote, X } from "lucide-react";
import { useStatusPopup } from "@/hooks/useStatusPopup";
import { CurrencyInput } from "@/components/ui/CurrencyInput";

export default function RepaymentModal({ loanId, status }: { loanId: string, status: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [amount, setAmount] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { showError, showSuccess, PopupComponent } = useStatusPopup();



    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Strip commas for submission (CurrencyInput already handles raw value, but being safe)
            const cleanAmount = amount.toString(); // Amount is already raw string from CurrencyInput
            const res = await fetch(`/api/loans/${loanId}/repay`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount: Number(cleanAmount) })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            setIsOpen(false);
            setAmount("");
            router.refresh();
            showSuccess("Repayment Recorded Successfully");
        } catch (err: any) {
            showError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (status !== "ACTIVE" && status !== "DEFAULTED") return null;

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-indigo-500/20"
            >
                <Banknote size={16} />
                Record Repayment
            </button>
        );
    }

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="bg-slate-950 border border-slate-800 rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
                    <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-500/10 rounded-lg">
                                <Banknote size={20} className="text-indigo-400" />
                            </div>
                            <h3 className="font-semibold text-white">Record Repayment</h3>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-1 hover:bg-slate-800 rounded-md transition-colors text-slate-400 hover:text-white"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-300">Repayment Amount</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">₹</span>
                                <CurrencyInput
                                    required
                                    className="w-full pl-8 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                                    placeholder="0.00"
                                    value={amount}
                                    onValueChange={setAmount}
                                    autoFocus
                                />
                            </div>
                            <p className="text-xs text-slate-500">
                                Enter the amount collected from the customer.
                            </p>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-500/20"
                            >
                                {loading ? <Loader2 size={16} className="animate-spin" /> : "Confirm"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            <PopupComponent />
        </>
    );
}
