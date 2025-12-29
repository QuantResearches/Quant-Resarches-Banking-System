"use client";

import { usePathname } from "next/navigation";
import { ChevronRight, Home, Bell } from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/Button";

export default function Header() {
    const pathname = usePathname();
    const paths = pathname.split('/').filter(Boolean);

    return (
        <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
            {/* Breadcrumbs */}
            <nav className="flex items-center text-sm font-medium text-slate-500">
                <Link href="/dashboard" className="hover:text-slate-900 transition-colors">
                    <Home size={16} />
                </Link>
                {paths.map((path, index) => {
                    const href = `/${paths.slice(0, index + 1).join('/')}`;
                    const isLast = index === paths.length - 1;
                    return (
                        <div key={path} className="flex items-center">
                            <ChevronRight size={14} className="mx-2 text-slate-400" />
                            {isLast ? (
                                <span className="text-slate-900 font-semibold capitalize bg-slate-100 px-2 py-0.5 rounded-md">
                                    {path.replace(/-/g, ' ')}
                                </span>
                            ) : (
                                <Link href={href} className="hover:text-slate-900 transition-colors capitalize">
                                    {path.replace(/-/g, ' ')}
                                </Link>
                            )}
                        </div>
                    );
                })}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="relative text-slate-500 hover:bg-slate-100">
                    <Bell size={20} />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                </Button>
            </div>
        </header>
    );
}
