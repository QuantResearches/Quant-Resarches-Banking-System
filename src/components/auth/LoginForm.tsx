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
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const res = await signIn("credentials", {
            email,
            password,
            redirect: false,
        });

        if (res?.error) {
            setError("Invalid credentials or account inactive.");
        } else {
            router.push("/dashboard");
        }
    };

    return (
        <div className="w-full max-w-sm bg-white border border-gray-200 shadow-sm">
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
                            className="w-full p-3 text-sm text-gray-900 bg-gray-50 border border-gray-200 placeholder-gray-400 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-colors"
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
                                className="w-full p-3 text-sm text-gray-900 bg-gray-50 border border-gray-200 placeholder-gray-400 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-colors pr-10"
                                placeholder="••••••••"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                tabIndex={-1}
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full py-3 px-4 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-colors uppercase tracking-wide"
                    >
                        Secure Sign In
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
