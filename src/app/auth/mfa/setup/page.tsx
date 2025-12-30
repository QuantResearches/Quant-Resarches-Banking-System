"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { QRCodeSVG } from "qrcode.react";
import { Loader2, ArrowLeft, ShieldCheck, Copy, Check } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { useStatusPopup } from "@/hooks/useStatusPopup";

export default function MFASetupPage() {
    const router = useRouter();
    const { data: session } = useSession();
    const [step, setStep] = useState<'loading' | 'scan' | 'verify' | 'success'>('loading');
    const [qrCode, setQrCode] = useState<string>("");
    const [secret, setSecret] = useState<string>("");
    const [verifyCode, setVerifyCode] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);
    const [copied, setCopied] = useState(false);
    const { showError, showSuccess, PopupComponent } = useStatusPopup();

    useEffect(() => {
        initSetup();
    }, []);

    const initSetup = async () => {
        try {
            const res = await fetch("/api/auth/mfa/setup", { method: "POST" });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error);

            setQrCode(data.qrCode);
            setSecret(data.secret);
            setStep('scan');
        } catch (error: any) {
            showError("Failed to initialize MFA setup: " + error.message);
        }
    };

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsVerifying(true);
        try {
            const res = await fetch("/api/auth/mfa/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code: verifyCode })
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Verification failed");

            setStep('success');
            showSuccess("Two-Factor Authentication Enabled Successfully!");

            setTimeout(() => {
                router.refresh(); // Forces a server-side re-validation
                router.push("/settings");
            }, 2000);

        } catch (error: any) {
            showError(error.message);
        } finally {
            setIsVerifying(false);
        }
    };

    const copySecret = () => {
        navigator.clipboard.writeText(secret);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md shadow-lg border-slate-200">
                <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                        <Link href="/settings" className="text-slate-400 hover:text-slate-600 transition-colors">
                            <ArrowLeft size={18} />
                        </Link>
                        <CardTitle>Setup Two-Factor Auth</CardTitle>
                    </div>
                    <CardDescription>Secure your account with TOTP (Authenticator App).</CardDescription>
                </CardHeader>
                <CardContent>
                    {step === 'loading' && (
                        <div className="flex flex-col items-center justify-center py-12 space-y-4">
                            <Loader2 className="animate-spin text-blue-600" size={40} />
                            <p className="text-sm text-slate-500">Generating secure keys...</p>
                        </div>
                    )}

                    {(step === 'scan' || step === 'verify') && (
                        <div className="space-y-6">
                            <div className="bg-white p-4 border border-slate-200 rounded-lg flex justify-center">
                                {qrCode && (
                                    <img
                                        src={qrCode}
                                        alt="MFA QR Code"
                                        width={200}
                                        height={200}
                                        className="mix-blend-multiply"
                                    />
                                )}
                            </div>

                            <div className="space-y-2">
                                <p className="text-sm font-medium text-slate-700">1. Scan QR Code</p>
                                <p className="text-xs text-slate-500">
                                    Open your authenticator app (Google Auth, Authy, etc.) and scan the image above.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <p className="text-sm font-medium text-slate-700">Can't scan?</p>
                                <div className="flex items-center gap-2">
                                    <code className="bg-slate-100 px-3 py-2 rounded text-xs font-mono text-slate-600 flex-1 truncate">
                                        {secret}
                                    </code>
                                    <button
                                        onClick={copySecret}
                                        className="p-2 hover:bg-slate-100 rounded text-slate-500 hover:text-blue-600 transition-colors"
                                        title="Copy Secret"
                                    >
                                        {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-3 pt-4 border-t border-slate-100">
                                <p className="text-sm font-medium text-slate-700">2. Enter Verification Code</p>
                                <form onSubmit={handleVerify} className="space-y-4">
                                    <Input
                                        placeholder="000 000"
                                        className="font-mono text-center text-lg tracking-widest"
                                        value={verifyCode}
                                        onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        maxLength={6}
                                        required
                                    />
                                    <Button
                                        type="submit"
                                        className="w-full bg-blue-600 hover:bg-blue-700"
                                        disabled={verifyCode.length !== 6 || isVerifying}
                                        isLoading={isVerifying}
                                    >
                                        Verify & Enable
                                    </Button>
                                </form>
                            </div>
                        </div>
                    )}

                    {step === 'success' && (
                        <div className="flex flex-col items-center justify-center py-8 space-y-4 text-center animate-in zoom-in duration-300">
                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                                <ShieldCheck size={32} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">MFA Enabled!</h3>
                            <p className="text-sm text-slate-500">
                                Your account is now protected with Two-Factor Authentication.
                            </p>
                            <Button variant="outline" onClick={() => router.push('/settings')}>
                                Return to Settings
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
            <PopupComponent />
        </div>
    );
}
