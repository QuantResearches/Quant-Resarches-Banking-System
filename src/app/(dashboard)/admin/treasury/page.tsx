import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Banknote, Landmark, TrendingUp, Wallet } from "lucide-react";
import InjectCapitalButton from "./InjectCapitalButton";
import BorrowFundsButton from "./BorrowFundsButton";

export default async function TreasuryPage() {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "admin" && session.user.role !== "finance")) {
        return <div className="p-8 text-center text-red-500">Unauthorized Access</div>;
    }

    // 1. Fetch Bank Capital (Equity)
    const capitalAccount = await prisma.account.findFirst({
        where: { account_type: "internal", customer: { email: "admin@quant.com" } },
        include: { balance: true }
    });
    const capitalBalance = Number(capitalAccount?.balance?.balance || 0);

    // 2. Fetch Customer Deposits (Liabilities)
    const liabilities = await prisma.accountBalance.aggregate({
        _sum: { balance: true },
        where: { account: { account_type: { in: ["savings", "current", "wallet"] }, status: "active" } }
    });
    const totalDeposits = Number(liabilities._sum.balance || 0);

    // 3. Fetch Loans Disbursed (Assets) - Outstanding Principal
    const pendingRepayments = await prisma.loanRepayment.aggregate({
        _sum: { principal_component: true },
        where: { status: { in: ["PENDING", "PARTIAL", "OVERDUE"] } }
    });
    const totalAssets = Number(pendingRepayments._sum.principal_component || 0);

    // Ideally calculate from LoanRepayment principal_component pending, but for MVP use Active Loan amounts or Balance?
    // Let's use Sum of Active Loans' approved_amount as a proxy for "Disbursed Asset" or better:
    // Outstanding = Total Disbursed - Total Repaid Principal.
    // For MVP transparency: Sum of 'amount_due' in pending repayments (includes interest, so slight overestimate of asset value but closer to 'Receivable').
    // Adjusted: Detailed Asset Calculation
    // 5. Fetch Wholesale Liabilities (Bank Debt)
    const liabilitiesData = await prisma.bankLiability.aggregate({
        _sum: { principal_amount: true },
        where: { status: "ACTIVE" }
    });
    const wholesaleDebt = Number(liabilitiesData._sum.principal_amount || 0);

    // Capital Balance (Liquidity) = Equity + Debt (since debt credits this account)
    // To see PURE Equity, we'd need to subtract wholesaleDebt from capitalBalance (approx).
    const estimatedEquity = capitalBalance - wholesaleDebt;

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Treasury Management</h1>
                    <p className="text-slate-500 mt-1">Manage Bank Capital, liquidity, and solvency.</p>
                </div>
                <div className="flex gap-3">
                    <BorrowFundsButton />
                    <InjectCapitalButton />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="border-indigo-100 bg-indigo-50/50">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-indigo-900">Total Liquidity (Cash)</CardTitle>
                        <Landmark className="h-4 w-4 text-indigo-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-indigo-700">{formatCurrency(capitalBalance)}</div>
                        <p className="text-xs text-indigo-600/80 mt-1">Funds Available for Lending</p>
                    </CardContent>
                </Card>

                <Card className="border-red-100 bg-red-50/50">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-red-900">Wholesale Liabilities</CardTitle>
                        <Wallet className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-700">{formatCurrency(wholesaleDebt)}</div>
                        <p className="text-xs text-red-600/80 mt-1">Bank Debt (Bonds/Loans)</p>
                    </CardContent>
                </Card>

                <Card className="border-emerald-100 bg-emerald-50/50">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-emerald-900">Loan Assets</CardTitle>
                        <TrendingUp className="h-4 w-4 text-emerald-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-700">{formatCurrency(totalAssets)}</div>
                        <p className="text-xs text-emerald-600/80 mt-1">Outstanding Principal</p>
                    </CardContent>
                </Card>

                <Card className="border-amber-100 bg-amber-50/50">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-amber-900">Customer Deposits</CardTitle>
                        <Wallet className="h-4 w-4 text-amber-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-amber-700">{formatCurrency(totalDeposits)}</div>
                        <p className="text-xs text-amber-600/80 mt-1">Retail & Corporate Deposits</p>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Capital Movements Table could go here */}
        </div>
    );
}
