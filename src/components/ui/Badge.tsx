import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "info" | "neutral";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
    const variants = {
        default: "border-transparent bg-slate-900 text-slate-50 hover:bg-slate-900/80",
        secondary: "border-transparent bg-slate-100 text-slate-900 hover:bg-slate-100/80",
        destructive: "border-transparent bg-red-50 text-red-700 hover:bg-red-100",
        success: "border-transparent bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
        warning: "border-transparent bg-amber-50 text-amber-700 hover:bg-amber-100",
        info: "border-transparent bg-blue-50 text-blue-700 hover:bg-blue-100",
        neutral: "border-transparent bg-slate-100 text-slate-600 hover:bg-slate-200",
        outline: "text-slate-950",
    }

    return (
        <div
            className={cn(
                "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2",
                variants[variant],
                className
            )}
            {...props}
        />
    )
}

export { Badge }
