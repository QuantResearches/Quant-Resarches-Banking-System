import prisma from "@/lib/prisma";
import AccountForm from "@/app/(dashboard)/accounts/create/AccountForm";
import { Card, CardContent } from "@/components/ui/Card";

export const dynamic = 'force-dynamic';

export default async function CreateAccountPage() {
    // Fetch active customers for dropdown
    const customers = await prisma.customer.findMany({
        where: { status: "active" },
        select: { id: true, full_name: true, email: true },
        orderBy: { full_name: "asc" }
    });

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Create Account</h1>
                <p className="text-sm text-slate-500">Open a new banking account for a customer.</p>
            </div>

            <Card className="border-slate-200 shadow-sm">
                <CardContent className="p-6">
                    <AccountForm customers={customers} />
                </CardContent>
            </Card>
        </div>
    );
}
