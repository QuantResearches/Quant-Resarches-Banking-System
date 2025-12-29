"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

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
        <Card className="w-full max-w-sm">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold flex items-center gap-2">
                    <span className="w-1 h-6 bg-blue-600 block rounded-full"></span>
                    System Login
                </CardTitle>
            </CardHeader>
            <CardContent>
                {error && (
                    <div className="mb-6 p-4 text-sm text-red-700 bg-red-50 border-l-4 border-red-500 rounded-sm" role="alert">
                        <p className="font-semibold">Authentication Failed</p>
                        <p>{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email" className="uppercase text-xs font-bold text-slate-500 tracking-wider">Email Address</Label>
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={isLoading}
                            placeholder="name@quant-researches.com"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password" className="uppercase text-xs font-bold text-slate-500 tracking-wider">Password</Label>
                        <div className="relative">
                            <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={isLoading}
                                placeholder="••••••••"
                                className="pr-10"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                disabled={isLoading}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 disabled:opacity-50 focus:outline-none"
                                tabIndex={-1}
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        disabled={isLoading}
                        isLoading={isLoading}
                        className="w-full uppercase tracking-wide font-bold"
                    >
                        Secure Sign In
                    </Button>
                </form>
            </CardContent>
            <CardFooter className="bg-slate-50 border-t border-slate-100 py-4 justify-center">
                <p className="text-xs text-slate-500 text-center">
                    By signing in, you agree to the <span className="text-blue-600 cursor-pointer hover:underline font-medium">Internal Security Policy</span>.
                </p>
            </CardFooter>
        </Card>
    );
}
