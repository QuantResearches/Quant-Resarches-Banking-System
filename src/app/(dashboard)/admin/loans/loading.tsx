import { Skeleton } from "@/components/ui/Skeleton";

export default function LoansLoading() {
    return (
        <div className="space-y-6 animate-pulse">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-64" />
                </div>
                <Skeleton className="h-9 w-36" />
            </div>

            {/* Table Skeleton */}
            <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                    <div className="flex gap-4">
                        <Skeleton className="h-5 w-20" />
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-5 w-20 ml-auto" />
                    </div>
                </div>
                <div className="p-0">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-4 p-4 border-b border-slate-100 last:border-0">
                            <Skeleton className="h-6 w-24" />
                            <Skeleton className="h-6 w-40" />
                            <Skeleton className="h-6 w-24" />
                            <Skeleton className="h-6 w-24" />
                            <Skeleton className="h-6 w-20" />
                            <Skeleton className="h-6 w-16 ml-auto" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
