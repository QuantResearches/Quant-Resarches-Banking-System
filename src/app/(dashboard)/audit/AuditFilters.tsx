
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

export default function AuditFilters() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const createQueryString = useCallback(
        (name: string, value: string) => {
            const params = new URLSearchParams(searchParams.toString());
            if (value) {
                params.set(name, value);
            } else {
                params.delete(name);
            }
            return params.toString();
        },
        [searchParams]
    );

    const handleFilterChange = (name: string, value: string) => {
        router.push("?" + createQueryString(name, value));
    };

    return (
        <div className="bg-white p-4 border border-gray-200 rounded mb-6 flex flex-wrap gap-4 items-end">
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Entity Type</label>
                <select
                    className="border border-gray-300 rounded px-3 py-2 text-sm w-40"
                    onChange={(e) => handleFilterChange("entity_type", e.target.value)}
                    defaultValue={searchParams.get("entity_type") || ""}
                >
                    <option value="">All Entities</option>
                    <option value="Account">Account</option>
                    <option value="Transaction">Transaction</option>
                    <option value="Customer">Customer</option>
                    <option value="User">User</option>
                    <option value="Loan">Loan</option>
                    <option value="CustomerProfile">CustomerProfile</option>
                </select>
            </div>

            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Action</label>
                <select
                    className="border border-gray-300 rounded px-3 py-2 text-sm w-40"
                    onChange={(e) => handleFilterChange("action", e.target.value)}
                    defaultValue={searchParams.get("action") || ""}
                >
                    <option value="">All Actions</option>
                    <option value="CREATE">Create</option>
                    <option value="UPDATE">Update</option>
                    <option value="DELETE">Delete</option>
                    <option value="LOGIN">Login</option>
                    <option value="APPROVE">Approve</option>
                    <option value="REJECT">Reject</option>
                </select>
            </div>

            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Entity ID</label>
                <input
                    type="text"
                    placeholder="Search ID..."
                    className="border border-gray-300 rounded px-3 py-2 text-sm w-48"
                    onChange={(e) => handleFilterChange("entity_id", e.target.value)}
                    defaultValue={searchParams.get("entity_id") || ""}
                />
            </div>

            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Start Date</label>
                <input
                    type="date"
                    className="border border-gray-300 rounded px-3 py-2 text-sm"
                    onChange={(e) => handleFilterChange("start_date", e.target.value)}
                    defaultValue={searchParams.get("start_date") || ""}
                />
            </div>

            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">End Date</label>
                <input
                    type="date"
                    className="border border-gray-300 rounded px-3 py-2 text-sm"
                    onChange={(e) => handleFilterChange("end_date", e.target.value)}
                    defaultValue={searchParams.get("end_date") || ""}
                />
            </div>
        </div>
    );
}
