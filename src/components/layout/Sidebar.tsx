import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { LayoutDashboard, Users, UserCircle, Wallet, FileText, ShieldAlert, LogOut, FileCheck, CheckCircle, Tags, Shield, PieChart } from "lucide-react";
import clsx from "clsx";
import { useState } from "react";
import ConfirmationModal from "../ui/ConfirmationModal";
import { Badge } from "../ui/Badge";

export default function Sidebar() {
    const pathname = usePathname();
    const { data: session } = useSession();
    const role = session?.user?.role;

    const links = [
        { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
        { name: "Customers", href: "/customers", icon: Users },
        { name: "Transactions", href: "/transactions", icon: FileText },

        // Modules
        { name: "Approvals", href: "/approvals", icon: CheckCircle, roles: ["admin", "finance"] },
        { name: "Loans", href: "/admin/loans", icon: Wallet, roles: ["admin", "finance"] },
        { name: "Reconciliation", href: "/admin/reconciliation", icon: FileCheck, roles: ["admin", "finance"] },

        // Reporting
        { name: "Reports", href: "/reports", icon: PieChart },

        // Admin
        { name: "Audit & Risk", href: "/risk", icon: ShieldAlert, roles: ["admin"] },
        { name: "Settings", href: "/settings", icon: Shield, roles: ["admin"] },
    ];

    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

    return (
        <>
            <aside className="hidden md:flex flex-col w-72 bg-slate-950 text-slate-300 h-screen fixed left-0 top-0 z-50 shadow-xl">
                {/* Brand */}
                <div className="p-6 pb-2">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-900/50">
                            Q
                        </div>
                        <div>
                            <h1 className="text-white font-bold text-base tracking-tight leading-none">Quant Researches</h1>
                            <span className="text-[10px] text-slate-500 font-mono">FINANCIAL CORE v2.4</span>
                        </div>
                    </div>
                    {/* User Profile Mini */}
                    <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-800/50 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400">
                            {session?.user?.name?.[0] || "U"}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{session?.user?.name || "User"}</p>
                            <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                <p className="text-xs text-slate-500 uppercase truncate">{role}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
                    <p className="px-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Main Menu</p>
                    {links
                        .filter(link => !link.roles || (role && link.roles.includes(role as string)))
                        .map((link) => {
                            const Icon = link.icon;
                            // Check if current path starts with link href
                            // Ensure /dashboard doesn"t match /dashboard/settings if /settings is separate
                            const isActive = pathname === link.href || (link.href !== "/dashboard" && pathname.startsWith(link.href));

                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={clsx(
                                        "flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-all rounded-lg group relative",
                                        isActive
                                            ? "bg-blue-600 text-white shadow-md shadow-blue-900/20"
                                            : "text-slate-400 hover:bg-slate-900 hover:text-white"
                                    )}
                                >
                                    <Icon className={clsx("w-4 h-4", isActive ? "text-white" : "text-slate-500 group-hover:text-white")} />
                                    {link.name}
                                    {link.name === "Approvals" && (
                                        <Badge variant="destructive" className="ml-auto bg-red-500/10 text-red-400 border-none px-1.5 py-0 h-5 text-[10px]">3</Badge>
                                    )}
                                </Link>
                            );
                        })}
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-slate-900">
                    <button
                        onClick={() => setIsLogoutModalOpen(true)}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-900 rounded-lg transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                    </button>
                    <div className="text-center mt-4 text-[10px] text-slate-600">
                        &copy; 2024 Quant Researches
                    </div>
                </div>
            </aside>

            <ConfirmationModal
                isOpen={isLogoutModalOpen}
                onClose={() => setIsLogoutModalOpen(false)}
                onConfirm={() => signOut({ callbackUrl: "/login" })}
                title="Confirm Sign Out"
                message="Are you sure you want to secure your session and sign out?"
                confirmText="Sign Out"
                isDestructive={true}
            />
        </>
    );
}
