"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";
import clsx from "clsx";
import {
    LayoutDashboard,
    Users,
    CreditCard,
    ArrowRightLeft,
    FileText,
    Settings,
    LogOut,
    Bell,
    Search,
    User,
    Menu,
    X,
    Shield,
    CheckCircle,
    Wallet,
    PieChart,
    ChevronDown
} from "lucide-react";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import NotificationDropdown from "./NotificationDropdown";

export default function TopNavbar() {
    const pathname = usePathname();
    const { data: session, status } = useSession();
    const role = session?.user?.role;
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);

    const handleSignOut = () => {
        setIsProfileMenuOpen(false);
        setIsMobileMenuOpen(false);
        setShowSignOutConfirm(true);
    };

    const confirmSignOut = async () => {
        await signOut({ callbackUrl: "/login" });
    };

    const links = [
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { name: "Customers", href: "/customers", icon: Users },
        { name: "Accounts", href: "/accounts", icon: CreditCard },
        { name: "Transactions", href: "/transactions", icon: ArrowRightLeft },
        { name: "Loans", href: "/admin/loans", icon: Wallet, roles: ["admin", "finance"] },
        { name: "Approvals", href: "/approvals", icon: CheckCircle, roles: ["admin", "finance"] },
        { name: "Reconciliation", href: "/reconciliation", icon: ArrowRightLeft, roles: ["admin", "finance", "auditor"] },
        { name: "Compliance", href: "/compliance", icon: Shield, roles: ["admin", "compliance"] },
        { name: "Reports", href: "/reports", icon: FileText },
    ];

    // Persist links during loading to prevent flicker (optimistic) or show skeleton
    // If status is loading, we might show empty or basic links. 
    // Better: Show basic links always, restricted links only if confirmed.
    // To solve "disappearing", we can defer rendering the list until loaded OR render what we can.
    // If we use 'clsx' to fade in, it might help.

    const filteredLinks = links.filter(link => !link.roles || (role && link.roles.includes(role as string)));
    const isLoading = status === "loading";

    return (
        <>
            <ConfirmationModal
                isOpen={showSignOutConfirm}
                onClose={() => setShowSignOutConfirm(false)}
                onConfirm={confirmSignOut}
                title="Sign Out"
                message="Are you sure you want to sign out of your account?"
                confirmText="Sign Out"
                isDestructive={true}
            />

            {/* Midnight Premium Header (Refined) */}
            <header className="fixed top-0 left-0 right-0 h-16 bg-slate-950 border-b border-slate-800 z-50 flex items-center justify-between px-4 md:px-6 shadow-md transition-all duration-300">
                {/* 1. Branding */}
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-[0_0_15px_rgba(37,99,235,0.4)] ring-1 ring-white/10">
                        Q
                    </div>
                    <div className="hidden md:block">
                        <Link href="/dashboard" className="group flex items-center">
                            <h1 className="text-white font-medium text-lg tracking-tight group-hover:text-blue-400 transition-colors">Quant Researches</h1>
                        </Link>
                    </div>
                </div>

                {/* 2. Desktop Navigation (Standard Flex, No Scroll) */}
                <div className="hidden md:flex items-center gap-8 mx-auto">
                    {isLoading ? (
                        <div className="flex gap-4 animate-pulse">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="h-4 w-20 bg-slate-800 rounded"></div>
                            ))}
                        </div>
                    ) : (
                        filteredLinks.map((link) => {
                            const isActive = pathname === link.href || (link.href !== "/dashboard" && pathname.startsWith(link.href));
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={clsx(
                                        "text-sm font-medium transition-colors duration-200 relative py-1",
                                        isActive
                                            ? "text-white"
                                            : "text-slate-400 hover:text-white"
                                    )}
                                >
                                    <span>{link.name}</span>
                                    {isActive && (
                                        <span className="absolute -bottom-[21px] left-0 right-0 h-[3px] bg-blue-500 rounded-t-full shadow-[0_0_10px_rgba(59,130,246,0.6)]"></span>
                                    )}
                                </Link>
                            );
                        })
                    )}
                </div>

                {/* 3. Right Actions (No Search) */}
                <div className="flex items-center gap-4 ml-auto md:ml-0">
                    {/* Notifications */}
                    <div className="relative">
                        <NotificationDropdown />
                    </div>

                    {/* Vertical Divider */}
                    <div className="h-5 w-px bg-slate-800"></div>

                    {/* Profile Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                            className={clsx(
                                "flex items-center gap-3 group p-1 pr-3 rounded-lg transition-all duration-200 border",
                                isProfileMenuOpen ? "bg-slate-800 border-slate-700" : "border-transparent hover:bg-slate-900 hover:border-slate-800"
                            )}
                        >
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 text-slate-200 flex items-center justify-center border border-slate-700 shadow-sm ring-1 ring-white/5">
                                <span className="text-xs font-bold">{session?.user?.name?.[0] || "U"}</span>
                            </div>
                            <div className="hidden md:block text-left leading-tight">
                                <p className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">{session?.user?.name?.split(' ')[0]}</p>
                            </div>
                            <ChevronDown size={14} className={clsx("text-slate-500 transition-transform duration-200", isProfileMenuOpen && "rotate-180")} />
                        </button>

                        {/* Dropdown Menu */}
                        {isProfileMenuOpen && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setIsProfileMenuOpen(false)}></div>
                                <div className="absolute right-0 top-full mt-2 w-56 bg-slate-950 rounded-lg shadow-xl border border-slate-800 z-50 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                    <div className="px-4 py-3 border-b border-slate-800 bg-slate-900/50">
                                        <p className="text-sm font-medium text-white">{session?.user?.name}</p>
                                        <p className="text-xs text-slate-500 truncate">{session?.user?.email}</p>
                                    </div>
                                    <div className="p-1 space-y-0.5">
                                        <Link href="/profile" className="flex items-center gap-3 px-3 py-2 text-xs font-medium text-slate-400 hover:bg-slate-900 hover:text-white rounded-md transition-colors">
                                            <User size={14} className="text-slate-500" />
                                            My Profile
                                        </Link>
                                        <Link href="/settings" className="flex items-center gap-3 px-3 py-2 text-xs font-medium text-slate-400 hover:bg-slate-900 hover:text-white rounded-md transition-colors">
                                            <Shield size={14} className="text-slate-500" />
                                            Security Settings
                                        </Link>
                                    </div>
                                    <div className="border-t border-slate-800 p-1 mt-1">
                                        <button
                                            onClick={handleSignOut}
                                            className="w-full flex items-center gap-3 px-3 py-2 text-xs font-medium text-red-400 hover:bg-slate-900 hover:text-red-300 rounded-md transition-colors"
                                        >
                                            <LogOut size={14} />
                                            Sign Out
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button
                        className="md:hidden text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* 4. Mobile Menu Overlay */}
                {isMobileMenuOpen && (
                    <div className="md:hidden absolute top-16 left-0 right-0 bg-slate-950 border-b border-slate-800 shadow-2xl animate-in slide-in-from-top-2">
                        <div className="p-4 space-y-1">
                            {filteredLinks.map((link) => {
                                const Icon = link.icon;
                                const isActive = pathname === link.href || (link.href !== "/dashboard" && pathname.startsWith(link.href));
                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={clsx(
                                            "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                                            isActive
                                                ? "bg-blue-900/20 text-blue-400"
                                                : "text-slate-400 hover:text-white hover:bg-slate-900"
                                        )}
                                    >
                                        <Icon size={18} />
                                        <span>{link.name}</span>
                                    </Link>
                                );
                            })}
                            <div className="h-px bg-slate-800 my-4"></div>
                            <button
                                onClick={handleSignOut}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-400 hover:bg-slate-900 hover:text-red-300 transition-colors"
                            >
                                <LogOut size={18} />
                                Sign Out
                            </button>
                        </div>
                    </div>
                )}
            </header>
        </>
    );
}
