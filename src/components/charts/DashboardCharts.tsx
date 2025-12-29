"use client";

import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function DashboardCharts() {
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        fetch('/api/reports/stats')
            .then(res => res.json())
            .then(setData);
    }, []);

    if (!data) return <div className="h-64 bg-gray-50 animate-pulse rounded border border-gray-100"></div>;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white p-6 border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 uppercase mb-6">Transaction Trend (7 Days)</h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data.lineChartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                            <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                            <YAxis tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                            <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e5e7eb' }} />
                            <Line type="monotone" dataKey="count" stroke="#2563EB" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="bg-white p-6 border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 uppercase mb-6">Monthly Cash Flow</h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data.barChartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                            <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                            <YAxis tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                            <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ background: '#fff', border: '1px solid #e5e7eb' }} />
                            <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={60} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
