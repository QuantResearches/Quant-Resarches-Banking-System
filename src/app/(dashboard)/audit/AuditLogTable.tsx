"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";

interface AuditLog {
    id: string;
    created_at: Date;
    user: {
        email: string;
        role: string;
    };
    action: string;
    entity_type: string;
    entity_id: string;
    old_value: any;
    new_value: any;
    ip_address: string | null;
}

export default function AuditLogTable({ logs }: { logs: AuditLog[] }) {
    const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

    return (
        <>
            <div className="bg-white border border-gray-200 overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-700 font-medium uppercase border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4">Time</th>
                            <th className="px-6 py-4">User</th>
                            <th className="px-6 py-4">Action</th>
                            <th className="px-6 py-4">Entity</th>
                            <th className="px-6 py-4">Details</th>
                            <th className="px-6 py-4">IP</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 text-gray-600">
                        {logs.map((log) => (
                            <tr key={log.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">{new Date(log.created_at).toLocaleString()}</td>
                                <td className="px-6 py-4">
                                    <div className="font-medium text-gray-900">{log.user.email}</div>
                                    <div className="text-xs text-gray-500">{log.user.role}</div>
                                </td>
                                <td className="px-6 py-4 font-semibold">{log.action}</td>
                                <td className="px-6 py-4">
                                    {log.entity_type} <span className="font-mono text-xs">({log.entity_id.slice(0, 6)})</span>
                                </td>
                                <td className="px-6 py-4">
                                    <button
                                        onClick={() => setSelectedLog(log)}
                                        className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                                    >
                                        View Details
                                    </button>
                                </td>
                                <td className="px-6 py-4 font-mono text-xs">{log.ip_address}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal
                isOpen={!!selectedLog}
                onClose={() => setSelectedLog(null)}
                title="Audit Log Details"
            >
                {selectedLog && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-xs">
                            <div>
                                <span className="block font-bold text-gray-500 uppercase">Action</span>
                                {selectedLog.action}
                            </div>
                            <div>
                                <span className="block font-bold text-gray-500 uppercase">Entity ID</span>
                                {selectedLog.entity_id}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="border border-red-100 rounded-lg overflow-hidden">
                                <div className="bg-red-50 px-3 py-2 border-b border-red-100 font-bold text-red-800 text-xs uppercase flex justify-between">
                                    <span>Before</span>
                                    {!selectedLog.old_value && <span className="text-red-400 font-normal opacity-75">Empty</span>}
                                </div>
                                <div className="p-3 bg-red-50/30 h-full min-h-[100px]">
                                    {selectedLog.old_value ? (
                                        <pre className="text-xs text-red-900 whitespace-pre-wrap font-mono">
                                            {JSON.stringify(selectedLog.old_value, null, 2)}
                                        </pre>
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-gray-400 text-xs italic">
                                            No previous data
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="border border-green-100 rounded-lg overflow-hidden">
                                <div className="bg-green-50 px-3 py-2 border-b border-green-100 font-bold text-green-800 text-xs uppercase flex justify-between">
                                    <span>After</span>
                                    {!selectedLog.new_value && <span className="text-green-400 font-normal opacity-75">Deleted</span>}
                                </div>
                                <div className="p-3 bg-green-50/30 h-full min-h-[100px]">
                                    {selectedLog.new_value ? (
                                        <pre className="text-xs text-green-900 whitespace-pre-wrap font-mono">
                                            {JSON.stringify(selectedLog.new_value, null, 2)}
                                        </pre>
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-gray-400 text-xs italic">
                                            Entity deleted
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </>
    );
}
