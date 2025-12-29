import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import UsersTable from "@/app/(dashboard)/users/UsersTable";
import Link from "next/link";
import { Plus } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function UsersPage() {
    const session = await getServerSession(authOptions);

    if (session?.user.role !== "admin") {
        redirect("/dashboard");
    }

    const users = await prisma.user.findMany({
        orderBy: { created_at: "desc" },
    });

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold">User Management</h1>
                <Link href="/users/create" className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 rounded-none transition-colors">
                    <Plus className="w-4 h-4" />
                    New User
                </Link>
            </div>

            <UsersTable users={users} />
        </div>
    );
}
