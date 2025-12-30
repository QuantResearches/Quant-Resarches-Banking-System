
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";

import { useStatusPopup } from "@/hooks/useStatusPopup";

export default function CreatePeriodForm() {
    const [name, setName] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { showError, showSuccess, PopupComponent } = useStatusPopup();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch("/api/compliance/period/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, start_date: startDate, end_date: endDate })
            });

            if (!res.ok) throw new Error("Failed to create period");

            router.refresh();
            setName("");
            setStartDate("");
            setEndDate("");
            showSuccess("Period Created");

        } catch (error: any) {
            showError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="border-slate-200 shadow-sm">
            <CardHeader>
                <CardTitle>Define Fiscal Period</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label>Period Name</Label>
                        <Input
                            type="text"
                            required
                            placeholder="e.g. Q4-2024"
                            value={name}
                            onChange={e => setName(e.target.value)}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Start Date</Label>
                            <Input
                                type="date"
                                required
                                value={startDate}
                                onChange={e => setStartDate(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>End Date</Label>
                            <Input
                                type="date"
                                required
                                value={endDate}
                                onChange={e => setEndDate(e.target.value)}
                            />
                        </div>
                    </div>

                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full"
                    >
                        {loading ? "Creating..." : "Create Period"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
