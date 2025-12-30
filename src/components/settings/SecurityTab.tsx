"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Shield, Smartphone, Key, History, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/Table";

interface SecurityTabProps {
    user: {
        mfa_enabled: boolean;
    };
    loginHistory: Array<{
        id: string;
        action: string;
        created_at: Date;
        ip_address: string | null;
        user_agent: string | null;
    }>;
}

export default function SecurityTab({ user, loginHistory }: SecurityTabProps) {
    return (
        <div className="space-y-6">
            {/* MFA Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Shield className="w-5 h-5 text-blue-600" />
                        Multi-Factor Authentication
                    </CardTitle>
                    <CardDescription>
                        Add an extra layer of security to your account by enabling two-step verification.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
                        <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${user.mfa_enabled ? 'bg-green-100 text-green-600' : 'bg-slate-200 text-slate-500'}`}>
                                <Smartphone size={20} />
                            </div>
                            <div>
                                <p className="font-medium text-slate-900">Authenticator App</p>
                                <p className="text-sm text-slate-500">
                                    {user.mfa_enabled
                                        ? "Your account is protected with 2FA."
                                        : "Secure your account with Google Authenticator."}
                                </p>
                            </div>
                        </div>

                        {user.mfa_enabled ? (
                            <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200">
                                Enabled
                            </Badge>
                        ) : (
                            <Button asChild size="sm">
                                <Link href="/auth/mfa/setup">Enable 2FA</Link>
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Login History */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <History className="w-5 h-5 text-slate-500" />
                        Recent Session Activity
                    </CardTitle>
                    <CardDescription>
                        A log of recent sign-in attempts to your account.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border border-slate-200 overflow-hidden">
                        <Table>
                            <TableHeader className="bg-slate-50">
                                <TableRow>
                                    <TableHead>Event</TableHead>
                                    <TableHead>Date & Time</TableHead>
                                    <TableHead>IP Address</TableHead>
                                    <TableHead>Device</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loginHistory.map((log) => (
                                    <TableRow key={log.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                {log.action === "LOGIN" ? (
                                                    <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                                                        LOGIN
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline" className="text-slate-600 border-slate-200 bg-slate-50">
                                                        {log.action}
                                                    </Badge>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {new Date(log.created_at).toLocaleString()}
                                        </TableCell>
                                        <TableCell className="font-mono text-xs">
                                            {log.ip_address || "Unknown"}
                                        </TableCell>
                                        <TableCell className="truncate max-w-[200px]" title={log.user_agent || ""}>
                                            {log.user_agent ? (
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-slate-900">{parseUserAgent(log.user_agent).browser}</span>
                                                    <span className="text-slate-500 text-xs">{parseUserAgent(log.user_agent).device}</span>
                                                </div>
                                            ) : "Unknown Device"}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {loginHistory.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-6 text-slate-500">
                                            No recent activity found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

// Helper to make UA string readable
function parseUserAgent(ua: string): { device: string, browser: string } {
    let device = "Unknown Device";
    let browser = "Unknown Browser";

    // Device Detection (Order matters!)
    if (ua.includes("Windows")) device = "Windows PC";
    else if (ua.includes("Mac")) device = "Macintosh";
    else if (ua.includes("iPhone")) device = "iPhone";
    else if (ua.includes("Android")) device = "Android Device";
    else if (ua.includes("Linux")) device = "Linux System";

    // Browser Detection
    if (ua.includes("Firefox")) browser = "Firefox";
    else if (ua.includes("Edg")) browser = "Microsoft Edge";
    else if (ua.includes("Chrome")) browser = "Chrome";
    else if (ua.includes("Safari")) browser = "Safari";
    else if (ua.includes("Opera") || ua.includes("OPR")) browser = "Opera";

    return { device, browser };
}
