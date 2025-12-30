import { Skeleton } from "@/components/ui/Skeleton";

export default function TransactionsLoading() {
    return (
        <div className="space-y-6 animate-pulse">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-56" />
                    <Skeleton className="h-4 w-80" />
                </div>
                <Skeleton className="h-9 w-40" />
            </div>

            {/* Table Skeleton */}
            <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                    <div className="flex gap-4">
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-5 w-24 ml-auto" />
                    </div>
                </div>
                <div className="p-0">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-4 p-4 border-b border-slate-100 last:border-0">
                            <Skeleton className="h-6 w-32" />
                            <Skeleton className="h-6 w-40" />
                            <Skeleton className="h-6 w-24" />
                            <Skeleton className="h-6 w-24" />
                            <Skeleton className="h-6 w-32" />
                            <Skeleton className="h-6 w-16 ml-auto" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
