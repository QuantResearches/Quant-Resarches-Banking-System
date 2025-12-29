import prisma from "@/lib/prisma";
import AccountForm from "@/app/(dashboard)/accounts/create/AccountForm";

export const dynamic = 'force-dynamic';

export default async function CreateAccountPage() {
    // Fetch active customers for dropdown
    const customers = await prisma.customer.findMany({
        where: { status: "active" },
        select: { id: true, full_name: true, email: true },
        orderBy: { full_name: "asc" }
    });

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-semibold mb-6">Create New Account</h1>
            <AccountForm customers={customers} />
        </div>
    );
}
