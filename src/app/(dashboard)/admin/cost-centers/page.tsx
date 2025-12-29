
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import CreateCostCenterForm from "@/app/(dashboard)/admin/cost-centers/CreateCostCenterForm";

export const dynamic = 'force-dynamic';

export default async function CostCentersPage() {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "admin" && session.user.role !== "finance")) {
        redirect("/dashboard");
    }

    // @ts-ignore
    const costCenters = await prisma.costCenter.findMany({
        orderBy: { code: 'asc' }
    });

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Cost Centers</h1>
                <CreateCostCenterForm />
            </div>

            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-700 font-medium uppercase border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4">Code</th>
                            <th className="px-6 py-4">Name</th>
                            <th className="px-6 py-4">Description</th>
                            <th className="px-6 py-4">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 text-gray-600">
                        {costCenters.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-4 text-center text-gray-500">No cost centers found.</td>
                            </tr>
                        ) : (
                            costCenters.map((cc: any) => (
                                <tr key={cc.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-mono font-medium text-gray-900">{cc.code}</td>
                                    <td className="px-6 py-4">{cc.name}</td>
                                    <td className="px-6 py-4">{cc.description || "-"}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs rounded-full ${cc.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {cc.is_active ? "ACTIVE" : "INACTIVE"}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
