
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import ManualReconciliationClient from "./ManualReconciliationClient";

export const dynamic = 'force-dynamic';

export default async function ManualReconciliationPage() {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "admin" && session.user.role !== "finance")) {
        redirect("/dashboard");
    }

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Manual Reconciliation</h1>
            <ManualReconciliationClient />
        </div>
    );
}
