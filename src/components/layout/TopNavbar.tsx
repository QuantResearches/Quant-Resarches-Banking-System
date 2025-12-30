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

export default function TopNavbar() {
    const pathname = usePathname();
    const { data: session } = useSession();
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
        { name: "Reports", href: "/reports/profit-loss", icon: FileText },
    ];

    const filteredLinks = links.filter(link => !link.roles || (role && link.roles.includes(role as string)));

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

            <header className="fixed top-0 left-0 right-0 h-16 bg-slate-950 border-b border-slate-800 z-50 flex items-center justify-between px-4 md:px-6 shadow-sm">
                {/* 1. Branding */}
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-700 rounded-md flex items-center justify-center text-white font-bold text-lg shadow-inner">
                        Q
                    </div>
                    <div className="hidden md:block">
                        <Link href="/dashboard">
                            <h1 className="text-white font-semibold text-sm leading-tight tracking-tight">Quant Researches</h1>
                            <p className="text-[10px] text-slate-400 font-mono leading-none">INTERNAL SYSTEMS</p>
                        </Link>
                    </div>
                </div>

                {/* 2. Desktop Navigation */}
                <div className="hidden md:flex items-center gap-1 mx-6 overflow-x-auto no-scrollbar mask-gradient">
                    {filteredLinks.map((link) => {
                        const isActive = pathname === link.href || (link.href !== "/dashboard" && pathname.startsWith(link.href));
                        const Icon = link.icon;
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={clsx(
                                    "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 border border-transparent",
                                    isActive
                                        ? "bg-slate-800 text-white border-slate-700/50 shadow-sm"
                                        : "text-slate-400 hover:text-slate-100 hover:bg-slate-900"
                                )}
                            >
                                <Icon size={16} />
                                <span>{link.name}</span>
                            </Link>
                        );
                    })}
                </div>

                {/* 3. Right Actions */}
                <div className="flex items-center gap-3 ml-auto">
                    {/* Notifications */}
                    <div className="relative group">
                        <button className="text-slate-400 hover:text-white relative p-2 rounded-full hover:bg-slate-900 transition-colors">
                            <Bell size={18} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-slate-950"></span>
                        </button>
                    </div>

                    {/* Vertical Divider */}
                    <div className="h-6 w-px bg-slate-800 mx-1"></div>

                    {/* Profile Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                            className="flex items-center gap-2 group p-1 pr-2 rounded-full hover:bg-slate-900 transition-colors border border-transparent hover:border-slate-800"
                        >
                            <div className="w-8 h-8 rounded-full bg-blue-900/30 text-blue-400 flex items-center justify-center border border-blue-800">
                                <span className="text-xs font-bold">{session?.user?.name?.[0] || "U"}</span>
                            </div>
                            <div className="hidden md:block text-left">
                                <p className="text-xs font-medium text-slate-200 group-hover:text-white">{session?.user?.name?.split(' ')[0]}</p>
                                <p className="text-[10px] text-slate-500 uppercase">{role}</p>
                            </div>
                            <ChevronDown size={14} className="text-slate-500 group-hover:text-slate-300" />
                        </button>

                        {/* Dropdown Menu */}
                        {isProfileMenuOpen && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setIsProfileMenuOpen(false)}></div>
                                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-xl border border-slate-200 z-50 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                    <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                                        <p className="text-sm font-medium text-slate-900">{session?.user?.name}</p>
                                        <p className="text-xs text-slate-500 truncate">{session?.user?.email}</p>
                                    </div>
                                    <div className="py-1">
                                        <Link href="/profile" className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600">
                                            <User size={14} />
                                            My Profile
                                        </Link>
                                        <Link href="/settings" className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600">
                                            <Shield size={14} />
                                            Security Settings
                                        </Link>
                                    </div>
                                    <div className="border-t border-slate-100 py-1">
                                        <button
                                            onClick={handleSignOut}
                                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
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
                        className="md:hidden text-slate-400 hover:text-white p-2"
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
                                            "flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium",
                                            isActive
                                                ? "bg-blue-600 text-white"
                                                : "text-slate-400 hover:text-white hover:bg-slate-900"
                                        )}
                                    >
                                        <Icon size={18} />
                                        <span>{link.name}</span>
                                    </Link>
                                );
                            })}
                            <div className="h-px bg-slate-800 my-2"></div>
                            <button
                                onClick={handleSignOut}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium text-red-400 hover:bg-slate-900"
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
