"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, MapPin, FileText, ShieldCheck, AlertTriangle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";

export default function BankCustomerForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const data: any = {};
        formData.forEach((value, key) => data[key] = value);

        try {
            const res = await fetch("/api/customers", {
                method: "POST",
                body: JSON.stringify(data),
                headers: { "Content-Type": "application/json" },
            });

            if (!res.ok) {
                const json = await res.json();
                throw new Error(json.error || "Failed to create customer record");
            }

            router.push("/customers");
            router.refresh();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in duration-300 pb-12">
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex items-center gap-2">
                    <AlertTriangle size={18} />
                    <span className="text-sm font-medium">{error}</span>
                </div>
            )}

            {/* Section 1: Personal Identity */}
            <Card>
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-4">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                            <User size={18} />
                        </div>
                        <CardTitle className="text-base">Personal Identity</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
                    <div className="space-y-2">
                        <Label>Full Legal Name <span className="text-red-500">*</span></Label>
                        <Input name="full_name" required placeholder="AS PER GOVT ID" />
                    </div>
                    <div className="space-y-2">
                        <Label>Date of Birth <span className="text-red-500">*</span></Label>
                        <Input name="dob" type="date" required />
                    </div>
                    <div className="space-y-2">
                        <Label>Gender <span className="text-red-500">*</span></Label>
                        <Select name="gender" required>
                            <option value="">Select Gender</option>
                            <option value="MALE">Male</option>
                            <option value="FEMALE">Female</option>
                            <option value="OTHER">Other</option>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Nationality <span className="text-red-500">*</span></Label>
                        <Input name="nationality" defaultValue="INDIAN" required readOnly className="bg-slate-50" />
                    </div>
                    <div className="space-y-2">
                        <Label>Marital Status</Label>
                        <Select name="marital_status">
                            <option value="">Select Status</option>
                            <option value="SINGLE">Single</option>
                            <option value="MARRIED">Married</option>
                            <option value="DIVORCED">Divorced</option>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Father's Name</Label>
                        <Input name="father_name" />
                    </div>
                </CardContent>
            </Card>

            {/* Section 2: Contact & Address */}
            <Card>
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-4">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                            <MapPin size={18} />
                        </div>
                        <CardTitle className="text-base">Contact & Address</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                    <div className="space-y-2">
                        <Label>Mobile Number <span className="text-red-500">*</span></Label>
                        <Input name="phone" required pattern="\d{10}" maxLength={10} placeholder="10 Digits" className="font-mono" />
                    </div>
                    <div className="space-y-2">
                        <Label>Email Address <span className="text-red-500">*</span></Label>
                        <Input name="email" type="email" required />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                        <Label>Permanent Address <span className="text-red-500">*</span></Label>
                        <Input name="address" required placeholder="Street, Locality" />
                    </div>
                    <div className="grid grid-cols-3 gap-6 md:col-span-2">
                        <div className="space-y-2">
                            <Label>City <span className="text-red-500">*</span></Label>
                            <Input name="city" required />
                        </div>
                        <div className="space-y-2">
                            <Label>State <span className="text-red-500">*</span></Label>
                            <Input name="state" required />
                        </div>
                        <div className="space-y-2">
                            <Label>Pincode <span className="text-red-500">*</span></Label>
                            <Input name="pincode" required pattern="\d{6}" maxLength={6} className="font-mono" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Section 3: Legal Identifiers */}
            <Card>
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-4">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                            <FileText size={18} />
                        </div>
                        <CardTitle className="text-base">Legal Identifiers (KYC)</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                    <div className="space-y-2">
                        <Label>PAN Number <span className="text-red-500">*</span></Label>
                        <Input name="pan" required pattern="[A-Z]{5}[0-9]{4}[A-Z]{1}" maxLength={10} placeholder="ABCDE1234F" className="font-mono uppercase" />
                        <p className="text-[10px] text-slate-400">Format: 5 Letters, 4 Digits, 1 Letter</p>
                    </div>
                    <div className="space-y-2">
                        <Label>Aadhaar Number <span className="text-red-500">*</span></Label>
                        <Input name="aadhaar_number" required pattern="\d{12}" maxLength={12} placeholder="12 Digit Number" className="font-mono" />
                    </div>
                </CardContent>
            </Card>

            {/* Section 4: Risk Profile */}
            <Card>
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-4">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-red-100 text-red-600 rounded-lg">
                            <ShieldCheck size={18} />
                        </div>
                        <CardTitle className="text-base">Risk Assessment</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                    <div className="space-y-2">
                        <Label>Initial Risk Category <span className="text-red-500">*</span></Label>
                        <Select name="risk_category" required>
                            <option value="LOW">Low</option>
                            <option value="MEDIUM">Medium</option>
                            <option value="HIGH">High</option>
                        </Select>
                    </div>
                    <div className="flex items-center gap-3 pt-8">
                        <input type="checkbox" name="pep_flag" id="pep_flag" className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500" />
                        <Label htmlFor="pep_flag">Flag as Politically Exposed Person (PEP)</Label>
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end gap-3 pt-4 sticky bottom-4 z-10 bg-white/80 p-4 border border-slate-200 shadow-lg backdrop-blur-sm rounded-xl">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={loading}
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    isLoading={loading}
                    className="bg-blue-600 hover:bg-blue-700 w-48"
                >
                    Create Customer Master
                </Button>
            </div>
        </form>
    );
}
