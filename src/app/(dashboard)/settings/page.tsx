import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // Fixed import path
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { Shield, User, Key, Lock } from "lucide-react";
import ProfileTab from "../../../components/settings/ProfileTab";
import SecurityTab from "../../../components/settings/SecurityTab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/Tabs";

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        redirect("/login");
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: {
            id: true,
            email: true,
            role: true,
            created_at: true,
            last_login_at: true,
            mfa_enabled: true,
        }
    });

    if (!user) return <div>User not found</div>;

    // Fetch Security History (Last 10 logins/failures)
    const loginHistory = await prisma.auditLog.findMany({
        where: {
            user_id: user.id,
            action: { in: ["LOGIN", "LOGOUT"] }
        },
        orderBy: { created_at: "desc" },
        take: 10
    });

    return (
        <div className="animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-6 mb-8">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Account Settings</h1>
                    <p className="text-sm text-slate-500 mt-1">Manage your profile, security preferences, and session activity.</p>
                </div>
            </div>

            <Tabs defaultValue="profile" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
                    <TabsTrigger value="profile" className="flex items-center gap-2">
                        <User size={14} />
                        Profile
                    </TabsTrigger>
                    <TabsTrigger value="security" className="flex items-center gap-2">
                        <Shield size={14} />
                        Security
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="space-y-6">
                    <ProfileTab user={user} />
                </TabsContent>

                <TabsContent value="security" className="space-y-6">
                    <SecurityTab user={user} loginHistory={loginHistory} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
