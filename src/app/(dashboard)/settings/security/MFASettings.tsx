
"use client";

import { useState } from "react";
import Image from "next/image";
import { Copy, Check, ShieldCheck, AlertTriangle } from "lucide-react";

export default function MFASettings({ mfaEnabled }: { mfaEnabled: boolean }) {
    const [step, setStep] = useState<"initial" | "setup" | "verify" | "success">(
        mfaEnabled ? "success" : "initial"
    );
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [secret, setSecret] = useState<string | null>(null);
    const [token, setToken] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const startSetup = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/auth/mfa/setup", { method: "POST" });
            const data = await res.json();
            if (data.error) throw new Error(data.error);

            setQrCode(data.qrCode);
            setSecret(data.secret);
            setStep("setup");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const verifyToken = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/auth/mfa/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token })
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);

            setStep("success");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 border border-gray-200 mt-6 max-w-2xl">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-blue-600" />
                Two-Factor Authentication (MFA)
            </h2>

            {step === "initial" && (
                <div>
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                        <div className="flex">
                            <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
                            <p className="text-sm text-yellow-700">
                                Start protecting your account today.
                                <br />
                                Recommended for all Finance and Admin users.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={startSetup}
                        disabled={loading}
                        className="px-4 py-2 bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? "Initializing..." : "Enable MFA"}
                    </button>
                    {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                </div>
            )}

            {step === "setup" && qrCode && (
                <div>
                    <p className="text-gray-600 mb-4">
                        1. Open your authenticator app (Google Auth, Authy).
                        <br />
                        2. Scan the QR code below.
                    </p>
                    <div className="border p-4 inline-block bg-white">
                        <Image src={qrCode} alt="MFA QR Code" width={200} height={200} />
                    </div>

                    <div className="mt-4">
                        <p className="text-sm text-gray-500 mb-2">Or enter code manually:</p>
                        <code className="bg-gray-100 p-2 rounded text-sm font-mono block w-full break-all">
                            {secret}
                        </code>
                    </div>

                    <div className="mt-8">
                        <p className="text-gray-600 mb-2">3. Enter the 6-digit code generated:</p>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                maxLength={6}
                                value={token}
                                onChange={(e) => setToken(e.target.value)}
                                className="border border-gray-300 px-3 py-2 w-40 text-center font-mono text-lg tracking-widest focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="000000"
                            />
                            <button
                                onClick={verifyToken}
                                disabled={loading || token.length !== 6}
                                className="px-4 py-2 bg-green-600 text-white font-medium hover:bg-green-700 disabled:opacity-50"
                            >
                                {loading ? "Verifying..." : "Verify & Enable"}
                            </button>
                        </div>
                        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                    </div>
                </div>
            )}

            {step === "success" && (
                <div className="text-center py-8">
                    <div className="bg-green-100 text-green-700 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                        <Check className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-green-800">MFA is Active</h3>
                    <p className="text-gray-600 mt-2">
                        Your account is secured with Two-Factor Authentication.
                    </p>
                </div>
            )}
        </div>
    );
}
