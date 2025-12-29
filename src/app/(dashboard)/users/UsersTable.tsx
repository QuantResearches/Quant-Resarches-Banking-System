"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { maskEmail } from "@/lib/masking";
import ConfirmationModal from "@/components/ui/ConfirmationModal";

interface User {
    id: string;
    email: string;
    role: string;
    is_active: boolean;
    last_login_at: Date | null;
}

export default function UsersTable({ users }: { users: User[] }) {
    const router = useRouter();
    const [loading, setLoading] = useState<string | null>(null); // Restore loading state for API calls
    const [targetUser, setTargetUser] = useState<{ id: string, active: boolean } | null>(null);

    const initiateToggle = (id: string, currentStatus: boolean) => {
        if (!currentStatus) return; // Only disabling supported per spec
        setTargetUser({ id, active: currentStatus });
    };

    const confirmToggle = async () => {
        if (!targetUser) return;

        setLoading(targetUser.id);
        try {
            const res = await fetch(`/api/users/${targetUser.id}/disable`, { method: "POST" });
            if (!res.ok) alert("Failed to disable user");
            else router.refresh();
        } finally {
            setLoading(null);
            setTargetUser(null);
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
                                        onClick={() => initiateToggle(user.id, user.is_active)}
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

            <ConfirmationModal
                isOpen={!!targetUser}
                onClose={() => setTargetUser(null)}
                onConfirm={confirmToggle}
                title="Disable User"
                message="Are you sure you want to disable this user? They will no longer be able to log in."
                confirmText="Disable Access"
                isDestructive={true}
                isLoading={!!loading}
            />
        </div>
    );
}
