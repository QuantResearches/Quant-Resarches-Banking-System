
import prisma from "@/lib/prisma";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import LoanActions from "./LoanActions";
import RepaymentModal from "./RepaymentModal";

export const dynamic = 'force-dynamic';

export default async function LoanDetailPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;

    const session = await getServerSession(authOptions);

    if (session?.user.role !== "admin" && session?.user.role !== "finance") {
        redirect("/dashboard");
    }

    const { id } = params;

    // @ts-ignore
    const loan = await prisma.loan.findUnique({
        where: { id },
        include: {
            customer: true,
            product: true,
            repayments: {
                orderBy: { due_date: 'asc' }
            }
        }
    });

    if (!loan) {
        return <div>Loan not found</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/loans" className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Loan Details</h1>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span className="font-mono">#{loan.id}</span>
                        <span>•</span>
                        <span>{loan.product.name}</span>
                    </div>
                </div>
                <div className="ml-auto flex gap-2">
                    <LoanActions loanId={loan.id} status={loan.status} />
                    <RepaymentModal loanId={loan.id} status={loan.status} />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Main Info Card */}
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Financial Overview</h2>
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="text-xs text-gray-500 uppercase font-semibold">Principal Amount</label>
                                <div className="text-2xl font-bold text-gray-900 mt-1">
                                    {Number(loan.applied_amount).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 uppercase font-semibold">Internal Status</label>
                                <div className={`text-lg font-medium mt-1 ${loan.status === 'ACTIVE' ? 'text-green-600' : 'text-gray-900'}`}>{loan.status}</div>
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 uppercase font-semibold">Interest Rate</label>
                                <div className="text-gray-900">{Number(loan.interest_rate)}% p.a.</div>
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 uppercase font-semibold">Tenure</label>
                                <div className="text-gray-900">{loan.tenure_months} Months</div>
                            </div>
                        </div>
                    </div>

                    {/* Schedule */}
                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                            <h3 className="font-semibold text-gray-900">Amortization Schedule</h3>
                        </div>
                        {loan.repayments.length > 0 ? (
                            <table className="w-full text-sm text-left">
                                <thead className="bg-white text-gray-500 font-medium border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 w-10">#</th>
                                        <th className="px-6 py-3">Due Date</th>
                                        <th className="px-6 py-3">Total Due</th>
                                        <th className="px-6 py-3">Paid</th>
                                        <th className="px-6 py-3">Principal</th>
                                        <th className="px-6 py-3">Interest</th>
                                        <th className="px-6 py-3 text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {loan.repayments.map((rp: any, index: number) => {
                                        const getStatusColor = (status: string) => {
                                            switch (status) {
                                                case 'PAID': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
                                                case 'PARTIAL': return 'bg-amber-50 text-amber-700 border-amber-200';
                                                case 'PENDING': return 'bg-slate-50 text-slate-700 border-slate-200';
                                                case 'OVERDUE': return 'bg-red-50 text-red-700 border-red-200';
                                                default: return 'bg-gray-50 text-gray-700 border-gray-200';
                                            }
                                        };

                                        const getAmountColor = (status: string) => {
                                            switch (status) {
                                                case 'PAID': return 'text-emerald-600';
                                                case 'PARTIAL': return 'text-amber-600';
                                                case 'PENDING': return 'text-slate-400';
                                                default: return 'text-gray-500';
                                            }
                                        };

                                        return (
                                            <tr key={rp.id}>
                                                <td className="px-6 py-3 text-gray-400">{index + 1}</td>
                                                <td className="px-6 py-3">{new Date(rp.due_date).toLocaleDateString()}</td>
                                                <td className="px-6 py-3 font-medium text-gray-900">
                                                    {Number(rp.amount_due).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                                                </td>
                                                <td className={`px-6 py-3 font-medium ${getAmountColor(rp.status)}`}>
                                                    {Number(rp.amount_paid).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                                                </td>
                                                <td className="px-6 py-3 text-gray-500">
                                                    {Number(rp.principal_component).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                                                </td>
                                                <td className="px-6 py-3 text-gray-500">
                                                    {Number(rp.interest_component).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                                                </td>
                                                <td className="px-6 py-3 text-right">
                                                    <span className={`px-2 py-0.5 rounded text-xs border ${getStatusColor(rp.status)}`}>
                                                        {rp.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        ) : (
                            <div className="p-8 text-center text-gray-500">
                                Schedule will be generated upon Disbursal.
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                        <h3 className="font-semibold text-gray-900 mb-4">Customer Info</h3>
                        <div className="space-y-3 text-sm">
                            <div>
                                <div className="text-gray-500 text-xs uppercase">Full Name</div>
                                <div className="font-medium text-blue-600">
                                    <Link href={`/customers/${loan.customer.id}`}>{loan.customer.full_name}</Link>
                                </div>
                            </div>
                            <div>
                                <div className="text-gray-500 text-xs uppercase">Email</div>
                                <div>{loan.customer.email}</div>
                            </div>
                            <div>
                                <div className="text-gray-500 text-xs uppercase">Contact</div>
                                <div>{loan.customer.phone}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
