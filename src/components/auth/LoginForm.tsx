"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

export default function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        const res = await signIn("credentials", {
            email,
            password,
            redirect: false,
        });

        if (res?.error) {
            setError("Invalid credentials or account inactive.");
            setIsLoading(false);
        } else {
            // Keep loading true while redirecting to avoid flash of "Active" button
            router.push("/dashboard");
        }
    };

    return (
        <div className="w-full max-w-sm bg-white border border-gray-200 shadow-sm relative overflow-hidden">
            {isLoading && (
                <div className="absolute top-0 left-0 w-full h-1 bg-blue-100 overflow-hidden">
                    <div className="animate-progress w-full h-full bg-blue-600 origin-left-right"></div>
                </div>
            )}
            <div className="p-8">
                <h2 className="mb-6 text-lg font-bold text-gray-900 flex items-center gap-2">
                    <span className="w-1 h-5 bg-blue-600 block"></span>
                    System Login
                </h2>

                {error && (
                    <div className="mb-6 p-4 text-sm text-red-700 bg-red-50 border-l-4 border-red-500" role="alert">
                        <p className="font-semibold">Authentication Failed</p>
                        <p>{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block mb-2 text-xs font-bold text-gray-500 uppercase tracking-wider">Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={isLoading}
                            className="w-full p-3 text-sm text-gray-900 bg-gray-50 border border-gray-200 placeholder-gray-400 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            placeholder="name@quant-researches.com"
                            required
                        />
                    </div>

                    <div>
                        <label className="block mb-2 text-xs font-bold text-gray-500 uppercase tracking-wider">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={isLoading}
                                className="w-full p-3 text-sm text-gray-900 bg-gray-50 border border-gray-200 placeholder-gray-400 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-colors pr-10 disabled:opacity-50 disabled:cursor-not-allowed"
                                placeholder="••••••••"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                disabled={isLoading}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                                tabIndex={-1}
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 px-4 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-colors uppercase tracking-wide disabled:opacity-75 disabled:cursor-wait flex justify-center items-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Verifying...
                            </>
                        ) : (
                            "Secure Sign In"
                        )}
                    </button>
                </form>
            </div>
            <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 text-center">
                <p className="text-xs text-gray-500">
                    By signing in, you agree to the <span className="text-blue-600 cursor-pointer hover:underline">Internal Security Policy</span>.
                </p>
            </div>
        </div>
    );
}
