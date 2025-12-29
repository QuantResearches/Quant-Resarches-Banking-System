
import prisma from "@/lib/prisma";
import Link from "next/link";
import { Plus, Settings } from "lucide-react";
// @ts-ignore
import CreateProductForm from "./CreateProductForm"; // We will create this next
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function LoanProductsPage() {
    const session = await getServerSession(authOptions);

    if (session?.user.role !== "admin" && session?.user.role !== "finance") {
        redirect("/dashboard");
    }

    // @ts-ignore
    const products = await prisma.loanProduct.findMany({
        orderBy: { name: 'asc' }
    });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Loan Products</h1>
                    <p className="text-sm text-gray-500">Configure loan types, interest rates, and limits.</p>
                </div>
                <CreateProductForm />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product: any) => (
                    <div key={product.id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 space-y-4 relative">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-bold text-lg text-gray-900">{product.name}</h3>
                                <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold mt-1">
                                    {product.interest_type.replace("_", " ")}
                                </div>
                            </div>
                            <span className={`px-2 py-1 text-xs rounded-full ${product.active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                                {product.active ? "Active" : "Inactive"}
                            </span>
                        </div>

                        <p className="text-sm text-gray-600 line-clamp-2 h-10">
                            {product.description || "No description provided."}
                        </p>

                        <div className="border-t border-gray-100 pt-4 space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Amount Range</span>
                                <span className="font-mono font-medium">
                                    {Number(product.min_amount).toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })} -
                                    {Number(product.max_amount).toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Interest (Annual)</span>
                                <span className="font-mono font-medium text-blue-600">
                                    {Number(product.interest_rate_min)}% - {Number(product.interest_rate_max)}%
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Tenure</span>
                                <span className="font-mono font-medium">
                                    {product.min_tenure_months} - {product.max_tenure_months} m
                                </span>
                            </div>
                        </div>

                        {/* <div className="pt-2">
                             <Button size="sm" variant="outline" className="w-full">Edit Configuration</Button>
                        </div> */}
                    </div>
                ))}

                {products.length === 0 && (
                    <div className="col-span-full py-12 text-center bg-gray-50 rounded border border-dashed border-gray-300">
                        <Settings className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">No Loan Products</h3>
                        <p className="text-gray-500 mb-4">Get started by creating your first loan product template.</p>
                        {/* Trigger handled by CreateProductForm in header ideally, but could duplicate here */}
                    </div>
                )}
            </div>
        </div>
    );
}
