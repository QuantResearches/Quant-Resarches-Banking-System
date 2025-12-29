"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

export default function CreateUserPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const data = {
            email: formData.get("email"),
            password: formData.get("password"),
            role: formData.get("role"),
        };

        try {
            const res = await fetch("/api/users", {
                method: "POST",
                body: JSON.stringify(data),
                headers: { "Content-Type": "application/json" },
            });

            if (!res.ok) {
                const json = await res.json();
                if (Array.isArray(json.error)) {
                    // Handle Zod issues array
                    throw new Error(json.error.map((e: any) => e.message).join(", "));
                }
                throw new Error(json.error || "Failed to create user");
            }

            router.push("/users");
            router.refresh();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto">
            <h1 className="text-2xl font-semibold mb-6">Create New System User</h1>

            <div className="bg-white border border-gray-200 p-6">
                {error && <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm border border-red-200">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input name="email" type="email" required className="w-full p-2 border border-gray-300 rounded-none focus:border-blue-500 focus:outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <div className="relative">
                            <input
                                name="password"
                                type={showPassword ? "text" : "password"}
                                required
                                className="w-full p-2 text-sm border border-gray-300 rounded-none focus:border-blue-500 focus:outline-none pr-10"
                                placeholder="12+ chars, mixed case, special"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                        <select name="role" required className="w-full p-2 border border-gray-300 rounded-none focus:border-blue-500 focus:outline-none bg-white">
                            <option value="viewer">Viewer</option>
                            <option value="finance">Finance</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button disabled={loading} type="submit" className="px-4 py-2 bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 rounded-none">
                            {loading ? "Creating..." : "Create User"}
                        </button>
                        <button disabled={loading} type="button" onClick={() => router.back()} className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 rounded-none">
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
