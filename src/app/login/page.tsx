import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 px-4">
            <div className="mb-10 text-center space-y-2">
                <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Quant Researches</h1>
                <p className="text-sm text-slate-500 font-medium uppercase tracking-wide">Internal Financial and Ledger Management System</p>
            </div>
            <LoginForm />
            <div className="mt-8 text-center">
                <p className="text-xs text-slate-400">Authorized Personnel Only. All actions are audited.</p>
            </div>
        </div>
    );
}
