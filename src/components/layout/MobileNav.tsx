
"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, LogOut, LayoutDashboard, Users, CheckCircle, Wallet, ShieldAlert, FileText, FileCheck, Tags, UserCircle, Shield } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import clsx from "clsx";
import { usePathname } from "next/navigation";
import ConfirmationModal from "../ui/ConfirmationModal";

export default function MobileNav() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();
    const { data: session } = useSession();
    const role = session?.user?.role;

    const links = [
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { name: "Customers", href: "/customers", icon: Users },
        { name: "Approvals", href: "/approvals", icon: CheckCircle, roles: ["admin", "finance"] },
        { name: "Loans", href: "/admin/loans", icon: Wallet, roles: ["admin", "finance"] },
        { name: "KYC Ops", href: "/admin/kyc", icon: ShieldAlert, roles: ["admin", "finance"] },
        { name: "Reconciliation", href: "/admin/reconciliation", icon: FileCheck, roles: ["admin", "finance"] },
        { name: "Cost Centers", href: "/admin/cost-centers", icon: Tags, roles: ["admin", "finance"] },
        { name: "Reports", href: "/reports", icon: FileText },
        { name: "User Management", href: "/users", icon: UserCircle, roles: ["admin"] },
        { name: "Risk Management", href: "/risk", icon: ShieldAlert, roles: ["admin"] },
        { name: "Compliance", href: "/compliance", icon: ShieldAlert, roles: ["admin"] },
        { name: "Audit Logs", href: "/audit", icon: ShieldAlert, roles: ["admin"] },
        { name: "Security Settings", href: "/settings/security", icon: Shield, roles: ["admin"] },
    ];

    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

    const filteredLinks = links.filter(link => !link.roles || (role && link.roles.includes(role as string)));

    return (
        <>
            <div className="md:hidden bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-50">
                <div className="flex justify-between items-center p-4">
                    <div>
                        <h1 className="font-bold text-lg tracking-tight">Quant Researches</h1>
                        <p className="text-[10px] text-slate-400">Mobile Access</p>
                    </div>
                    <button onClick={() => setIsOpen(!isOpen)} className="p-2 hover:bg-slate-800 rounded">
                        {isOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* Mobile Menu Overlay */}
                {isOpen && (
                    <div className="absolute top-16 left-0 right-0 bg-slate-900 shadow-xl border-b border-slate-800">
                        <nav className="p-4 max-h-[80vh] overflow-y-auto">
                            <ul className="space-y-1">
                                {filteredLinks.map((link) => {
                                    const Icon = link.icon;
                                    const isActive = pathname.startsWith(link.href);
                                    return (
                                        <li key={link.href}>
                                            <Link
                                                href={link.href}
                                                onClick={() => setIsOpen(false)}
                                                className={clsx(
                                                    "flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-lg transition-colors group",
                                                    isActive ? "bg-blue-600 text-white shadow-md shadow-blue-900/20" : "text-slate-300 hover:bg-slate-800 hover:text-white"
                                                )}
                                            >
                                                <Icon className={clsx("w-5 h-5", isActive ? "text-white" : "text-slate-500 group-hover:text-white")} />
                                                {link.name}
                                            </Link>
                                        </li>
                                    );
                                })}
                                <li className="pt-4 mt-4 border-t border-slate-800">
                                    <button
                                        onClick={() => setIsLogoutModalOpen(true)}
                                        className="flex w-full items-center gap-3 px-3 py-3 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
                                    >
                                        <LogOut className="w-5 h-5" />
                                        Sign Out
                                    </button>
                                </li>
                            </ul>
                        </nav>

                    </div>
                )}
            </div>

            <ConfirmationModal
                isOpen={isLogoutModalOpen}
                onClose={() => setIsLogoutModalOpen(false)}
                onConfirm={() => signOut({ callbackUrl: "/login" })}
                title="Confirm Sign Out"
                message="Are you sure you want to sign out?"
                confirmText="Sign Out"
                isDestructive={true}
            />
        </>
    );
}
