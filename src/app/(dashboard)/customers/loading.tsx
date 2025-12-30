import { Skeleton } from "@/components/ui/Skeleton";

export default function CustomersLoading() {
    return (
        <div className="space-y-6 animate-pulse">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-72" />
                </div>
                <Skeleton className="h-9 w-32" />
            </div>

            {/* Table Skeleton */}
            <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm">
                <div className="p-4 border-b border-slate-100">
                    <div className="flex gap-4">
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-6 w-32 ml-auto" />
                    </div>
                </div>
                <div className="space-y-4 p-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-4">
                            <Skeleton className="h-12 w-1/4" />
                            <Skeleton className="h-12 w-1/4" />
                            <Skeleton className="h-12 w-1/4" />
                            <Skeleton className="h-12 w-1/4" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
