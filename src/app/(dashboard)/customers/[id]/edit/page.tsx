"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Combobox } from "@/components/ui/Combobox";
import { INDIAN_STATES } from "@/data/indian-states";
import { Card, CardContent } from "@/components/ui/Card";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Loader2 } from "lucide-react";

export default function EditCustomerPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [customer, setCustomer] = useState<any>(null);

    useEffect(() => {
        fetch(`/api/customers/${id}`)
            .then(res => {
                if (!res.ok) throw new Error("Failed to load customer");
                return res.json();
            })
            .then(data => {
                setCustomer(data);
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    }, [id]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const data = {
            full_name: formData.get("full_name"),
            email: formData.get("email"),
            phone: formData.get("phone"),
            address: formData.get("address"),
            status: formData.get("status"),
            // Profile
            dob: formData.get("dob"),
            gender: formData.get("gender"),
            marital_status: formData.get("marital_status"),
            pan: formData.get("pan"),
            aadhaar: formData.get("aadhaar"),
            city: formData.get("city"),
            state: formData.get("state"),
            pincode: formData.get("pincode"),
        };

        try {
            const res = await fetch(`/api/customers/${id}`, {
                method: "PATCH",
                body: JSON.stringify(data),
                headers: { "Content-Type": "application/json" },
            });

            if (!res.ok) {
                const json = await res.json();
                const errorMessage = typeof json.error === 'string'
                    ? json.error
                    : Array.isArray(json.error)
                        ? json.error.map((e: any) => e.message || JSON.stringify(e)).join(", ")
                        : JSON.stringify(json.error);
                throw new Error(errorMessage || "Failed to update customer");
            }

            router.push("/customers");
            router.refresh();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-6">Loading...</div>;
    if (error) return <div className="p-6 text-red-600">Error: {error}</div>;
    if (!customer) return <div className="p-6">Customer not found</div>;

    return (
        <div className="max-w-3xl mx-auto space-y-6 pb-12">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Edit Customer</h1>
                <p className="text-sm text-slate-500">Update customer profile and KYC details.</p>
            </div>

            <Card className="border-slate-200 shadow-sm">
                <CardContent className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                                <span className="w-1 h-6 bg-blue-600 rounded-full"></span>
                                Basic Information
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Full Name</Label>
                                    <Input
                                        name="full_name"
                                        defaultValue={customer.full_name}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Email</Label>
                                    <Input
                                        name="email"
                                        type="email"
                                        defaultValue={customer.email}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Phone</Label>
                                    <Input
                                        name="phone"
                                        defaultValue={customer.phone}
                                        required
                                        pattern="\d{10}"
                                        title="Phone number must be exactly 10 digits"
                                        maxLength={10}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Status</Label>
                                    <Select
                                        name="status"
                                        defaultValue={customer.status}
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                        <option value="restricted">Restricted</option>
                                    </Select>
                                </div>
                                <div className="col-span-2 space-y-2">
                                    <Label>Address</Label>
                                    <textarea
                                        name="address"
                                        defaultValue={customer.address}
                                        rows={2}
                                        required
                                        className="flex min-h-[80px] w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-50 transition-all shadow-sm hover:border-blue-200"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-slate-100 space-y-4">
                            <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                                <span className="w-1 h-6 bg-purple-600 rounded-full"></span>
                                Extended Profile (KYC)
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Date of Birth</Label>
                                    <Input
                                        type="date"
                                        name="dob"
                                        defaultValue={customer.profile?.dob ? new Date(customer.profile.dob).toISOString().split('T')[0] : ''}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Gender</Label>
                                    <Select
                                        name="gender"
                                        defaultValue={customer.profile?.gender || ""}
                                    >
                                        <option value="">Select Gender</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Marital Status</Label>
                                    <Select
                                        name="marital_status"
                                        defaultValue={customer.profile?.marital_status || ""}
                                    >
                                        <option value="">Select Status</option>
                                        <option value="Single">Single</option>
                                        <option value="Married">Married</option>
                                        <option value="Divorced">Divorced</option>
                                        <option value="Widowed">Widowed</option>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>PAN Number</Label>
                                    <Input
                                        name="pan"
                                        defaultValue={customer.profile?.pan_encrypted || ""}
                                        className="uppercase font-mono"
                                        placeholder="ABCD1234E"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Aadhaar Number</Label>
                                    <Input
                                        name="aadhaar"
                                        defaultValue={customer.profile?.aadhaar_number_encrypted || ""}
                                        maxLength={12}
                                        className="font-mono"
                                        placeholder="12 Digit Number"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                                <div className="space-y-2">
                                    <Label>City</Label>
                                    <Input
                                        name="city"
                                        defaultValue={customer.profile?.city || ""}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>State</Label>
                                    {/* Combobox handles its own styling internally, might need update if it looks off */}
                                    <Combobox
                                        options={INDIAN_STATES}
                                        name="state"
                                        placeholder="Select State..."
                                        value={customer.profile?.state || ""}
                                        onChange={(val) => {
                                            setCustomer((prev: any) => ({
                                                ...prev,
                                                profile: { ...prev.profile, state: val }
                                            }));
                                        }}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Pincode</Label>
                                    <Input
                                        name="pincode"
                                        defaultValue={customer.profile?.pincode || ""}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 flex justify-end gap-3">
                            <Button type="button" variant="outline" onClick={() => router.back()}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={saving}>
                                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Changes
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
