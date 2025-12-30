"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Banknote, X } from "lucide-react";
import { useStatusPopup } from "@/hooks/useStatusPopup";

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
            const res = await fetch(`/api/loans/${loanId}/repay`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount: Number(amount) })
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
                className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800 text-sm font-medium"
            >
                <Banknote size={16} />
                Record Repayment
            </button>
        );
    }

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-sm">
                    <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-lg">
                        <h3 className="font-bold text-gray-900">Record Repayment</h3>
                        <button onClick={() => setIsOpen(false)}><X size={20} className="text-gray-500" /></button>
                    </div>
                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Repayment Amount</label>
                            <input
                                type="number"
                                step="0.01"
                                required
                                className="w-full p-2 border rounded matches"
                                placeholder="0.00"
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 text-white py-2 rounded font-medium hover:bg-blue-700 disabled:opacity-50 flex justify-center gap-2"
                        >
                            {loading && <Loader2 size={16} className="animate-spin" />}
                            Confirm Repayment
                        </button>
                    </form>
                </div>
            </div>
            <PopupComponent />
        </>
    );
}
