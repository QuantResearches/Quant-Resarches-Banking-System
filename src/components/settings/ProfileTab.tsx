"use client";

import { Card, CardContent } from "@/components/ui/Card";
import { User, Mail, Calendar, Shield } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

interface ProfileTabProps {
    user: {
        id: string;
        email: string;
        role: string;
        created_at: Date;
        last_login_at: Date | null;
    }
}

export default function ProfileTab({ user }: ProfileTabProps) {
    return (
        <Card>
            <CardContent className="p-6">
                <div className="flex items-center gap-6 mb-8">
                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-3xl border-4 border-white shadow-sm">
                        {user.email[0].toUpperCase()}
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 capitalize">
                            {user.email.split('@')[0].replace('.', ' ')}
                        </h2>
                        <div className="flex items-center gap-2 mt-1">
                            <Badge variant={user.role === 'admin' ? 'destructive' : 'default'} className="uppercase">
                                {user.role}
                            </Badge>
                            <span className="text-sm text-slate-500">{user.email}</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-500 mb-1">
                            <Mail size={16} />
                            Email Address
                        </div>
                        <div className="text-slate-900 font-medium">{user.email}</div>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-500 mb-1">
                            <Shield size={16} />
                            Role Permission
                        </div>
                        <div className="text-slate-900 font-medium capitalize">{user.role} Access</div>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-500 mb-1">
                            <Calendar size={16} />
                            Member Since
                        </div>
                        <div className="text-slate-900 font-medium">
                            {new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </div>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-500 mb-1">
                            <ActivityIcon />
                            Last Active
                        </div>
                        <div className="text-slate-900 font-medium">
                            {user.last_login_at
                                ? new Date(user.last_login_at).toLocaleString()
                                : "Never"
                            }
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function ActivityIcon() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
    )
}
