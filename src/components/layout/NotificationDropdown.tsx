"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, CheckCircle, AlertTriangle, Info } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'error';
    link?: string;
    time: string;
}

export default function NotificationDropdown() {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    // Fetch notifications
    const fetchNotifications = async () => {
        try {
            const res = await fetch("/api/notifications");
            if (res.ok) {
                const data = await res.json();
                setNotifications(data);
            }
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        }
    };

    // Initial fetch and polling
    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, []);

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const count = notifications.length;

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`relative p-2 rounded-full transition-colors ${isOpen ? "bg-slate-800 text-white" : "text-slate-400 hover:text-white hover:bg-slate-900"
                    }`}
            >
                <Bell size={18} />
                {count > 0 && (
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-slate-950 animate-pulse"></span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-xl border border-slate-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/80 backdrop-blur-sm">
                        <h3 className="text-sm font-semibold text-slate-900">Notifications</h3>
                        {count > 0 && (
                            <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-medium">
                                {count} new
                            </span>
                        )}
                    </div>

                    <div className="max-h-[320px] overflow-y-auto">
                        {count === 0 ? (
                            <div className="p-8 text-center text-slate-500">
                                <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                <p className="text-xs">No new notifications</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-50">
                                {notifications.map((notif) => (
                                    <div
                                        key={notif.id}
                                        onClick={() => {
                                            if (notif.link) {
                                                setIsOpen(false);
                                                router.push(notif.link);
                                            }
                                        }}
                                        className={`p-4 hover:bg-slate-50 transition-colors cursor-pointer flex gap-3 ${notif.link ? 'cursor-pointer' : ''}`}
                                    >
                                        <div className="mt-0.5">
                                            {notif.type === 'error' && <AlertTriangle size={16} className="text-red-500" />}
                                            {notif.type === 'warning' && <CheckCircle size={16} className="text-amber-500" />}
                                            {notif.type === 'info' && <Info size={16} className="text-blue-500" />}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-900">{notif.title}</p>
                                            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{notif.message}</p>
                                            <p className="text-[10px] text-slate-400 mt-2">
                                                {new Date(notif.time).toLocaleTimeString()}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
