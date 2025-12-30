"use client";

import { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AccountCharts({ id }: { id: string }) {
    const [data, setData] = useState<any[] | null>(null);

    useEffect(() => {
        fetch(`/api/accounts/${id}/stats`)
            .then(res => res.json())
            .then(setData);
    }, [id]);

    if (!data) return <div className="h-64 bg-gray-50 animate-pulse rounded border border-gray-100 mb-6"></div>;
    if (data.length === 0) return null;

    return (
        <div className="bg-white p-6 border border-gray-200 mb-6">
            <h3 className="text-sm font-semibold text-gray-700 uppercase mb-6">Balance History</h3>
            <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                        <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#9CA3AF" />
                        <YAxis tick={{ fontSize: 12 }} stroke="#9CA3AF" tickFormatter={(value) => `₹${value}`} />
                        <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e5e7eb' }} />
                        <Area type="monotone" dataKey="balance" stroke="#2563EB" fill="#EFF6FF" strokeWidth={2} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
