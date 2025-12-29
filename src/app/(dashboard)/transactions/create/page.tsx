import prisma from "@/lib/prisma";
import TransactionForm from "@/app/(dashboard)/transactions/create/TransactionForm";

export const dynamic = 'force-dynamic';

export default async function CreateTransactionPage() {
    // Fetch active accounts
    const accounts = await prisma.account.findMany({
        where: { status: "active" },
        include: { customer: { select: { full_name: true } }, balance: true },
        orderBy: { customer: { full_name: "asc" } }
    });

    // Serialize Decimal to number for Client Component
    const serializedAccounts = accounts.map(account => ({
        ...account,
        balance: account.balance ? {
            ...account.balance,
            balance: account.balance.balance.toNumber()
        } : null
    }));

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-semibold mb-6">Record Transaction</h1>
            <TransactionForm accounts={serializedAccounts} />
        </div>
    );
}
