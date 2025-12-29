"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { LayoutDashboard, Users, UserCircle, Wallet, Receipt, FileText, ShieldAlert, LogOut, FileCheck, CheckCircle, Tags, Shield } from "lucide-react";
import clsx from "clsx";
import { useState } from "react";
import ConfirmationModal from "../ui/ConfirmationModal";

export default function Sidebar() {
    const pathname = usePathname();
    const { data: session } = useSession();
    const role = session?.user?.role;

    const links = [
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { name: "Customers", href: "/customers", icon: Users },

        // Admin & Finance
        { name: "Approvals", href: "/approvals", icon: CheckCircle, roles: ["admin", "finance"] },
        { name: "Loans", href: "/admin/loans", icon: Wallet, roles: ["admin", "finance"] },
        { name: "KYC Ops", href: "/admin/kyc", icon: ShieldAlert, roles: ["admin", "finance"] },
        { name: "Reconciliation", href: "/admin/reconciliation", icon: FileCheck, roles: ["admin", "finance"] },
        { name: "Cost Centers", href: "/admin/cost-centers", icon: Tags, roles: ["admin", "finance"] },

        { name: "Reports", href: "/reports", icon: FileText },

        // Admin Only
        { name: "User Management", href: "/users", icon: UserCircle, roles: ["admin"] },
        { name: "Risk Management", href: "/risk", icon: ShieldAlert, roles: ["admin"] },
        { name: "Compliance", href: "/compliance", icon: ShieldAlert, roles: ["admin"] },
        { name: "Audit Logs", href: "/audit", icon: ShieldAlert, roles: ["admin"] },
        { name: "Security Settings", href: "/settings/security", icon: Shield, roles: ["admin"] },
    ];

    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

    return (
        <>
            <aside className="w-64 bg-slate-900 text-slate-300 hidden md:flex flex-col h-screen fixed left-0 top-0 border-r border-slate-800">
                <div className="p-6 border-b border-slate-800">
                    <h1 className="text-white font-bold text-lg tracking-tight">Quant Researches</h1>
                    <p className="text-xs text-slate-500 mt-1">Financial Ledger System</p>
                </div>

                <nav className="flex-1 overflow-y-auto py-4">
                    <ul className="space-y-1">
                        {links
                            .filter(link => !link.roles || (role && link.roles.includes(role as string)))
                            .map((link) => {
                                const Icon = link.icon;
                                const isActive = pathname.startsWith(link.href);
                                return (
                                    <li key={link.href}>
                                        <Link
                                            href={link.href}
                                            className={clsx(
                                                "flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors rounded-none",
                                                isActive
                                                    ? "bg-blue-900 text-white border-r-4 border-blue-500"
                                                    : "hover:bg-slate-800 hover:text-white"
                                            )}
                                        >
                                            <Icon className="w-5 h-5" />
                                            {link.name}
                                        </Link>
                                    </li>
                                );
                            })}
                    </ul>
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <div className="mb-4 px-2">
                        <p className="text-sm font-medium text-white">{session?.user?.email}</p>
                        <p className="text-xs text-slate-500 uppercase">{role}</p>
                    </div>
                    <button
                        onClick={() => setIsLogoutModalOpen(true)}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm font-medium text-red-400 hover:bg-slate-800 rounded-none transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                    </button>
                </div>
            </aside>

            <ConfirmationModal
                isOpen={isLogoutModalOpen}
                onClose={() => setIsLogoutModalOpen(false)}
                onConfirm={() => signOut({ callbackUrl: "/login" })}
                title="Confirm Sign Out"
                message="Are you sure you want to sign out of the secure banking console?"
                confirmText="Sign Out"
                isDestructive={true}
            />
        </>
    );
}
