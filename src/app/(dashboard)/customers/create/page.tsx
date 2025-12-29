"use client";

import BankCustomerForm from "@/components/customers/BankCustomerForm";

export default function CreateCustomerPage() {
    return (
        <div className="max-w-4xl mx-auto pb-10">
            <h1 className="text-2xl font-bold mb-2 text-slate-800">Customer Intake</h1>
            <p className="text-slate-500 mb-6 text-sm">Create a new customer master record with full KYC details.</p>

            <BankCustomerForm />
        </div>
    );
}
