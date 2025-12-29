import Sidebar from "@/components/layout/Sidebar";
import MobileNav from "@/components/layout/MobileNav";
import Header from "@/components/layout/Header";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
            <Sidebar />
            <div className="flex-1 md:ml-72 h-screen overflow-hidden flex flex-col">
                <MobileNav />
                {/* Desktop Header */}
                <div className="hidden md:block">
                    <Header />
                </div>
                <main className="flex-1 p-4 md:p-8 overflow-y-auto">
                    <div className="max-w-7xl mx-auto space-y-6">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
