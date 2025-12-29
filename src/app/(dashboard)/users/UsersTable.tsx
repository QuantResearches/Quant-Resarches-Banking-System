"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { maskEmail } from "@/lib/masking";

interface User {
    id: string;
    email: string;
    role: string;
    is_active: boolean;
    last_login_at: Date | null;
}

export default function UsersTable({ users }: { users: User[] }) {
    const router = useRouter();
    const [loading, setLoading] = useState<string | null>(null);

    const toggleStatus = async (id: string, currentStatus: boolean) => {
        if (!confirm(`Are you sure you want to ${currentStatus ? "disable" : "enable"} this user?`)) return;

        // Note: My API only has /disable endpoint. Re-enabling would require /enable or PATCH is_active.
        // My spec said "POST /api/users/:id/disable". Didn't specify enable.
        // I will implement disable only for now as per spec strictness.
        if (!currentStatus) return;

        setLoading(id);
        try {
            const res = await fetch(`/api/users/${id}/disable`, { method: "POST" });
            if (!res.ok) alert("Failed to disable user");
            else router.refresh();
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="bg-white border border-gray-200 overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-700 font-medium uppercase border-b border-gray-200">
                    <tr>
                        <th className="px-6 py-4">Email</th>
                        <th className="px-6 py-4">Role</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Last Login</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-gray-600">
                    {users.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 font-medium text-gray-900">{maskEmail(user.email)}</td>
                            <td className="px-6 py-4 capitalize">{user.role}</td>
                            <td className="px-6 py-4">
                                <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-none ${user.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                    {user.is_active ? "Active" : "Disabled"}
                                </span>
                            </td>
                            <td className="px-6 py-4">{user.last_login_at ? new Date(user.last_login_at).toLocaleString() : "-"}</td>
                            <td className="px-6 py-4 text-right">
                                {user.is_active && (
                                    <button
                                        onClick={() => toggleStatus(user.id, user.is_active)}
                                        disabled={loading === user.id}
                                        className="text-red-600 hover:underline disabled:opacity-50"
                                    >
                                        Disable
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
