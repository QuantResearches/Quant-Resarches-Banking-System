export default function Loading() {
    return (
        <div className="space-y-6 animate-pulse">
            {/* Page Header Skeleton */}
            <div className="flex justify-between items-center">
                <div className="h-8 bg-gray-200 rounded w-48"></div>
                <div className="h-10 bg-gray-200 rounded w-32"></div>
            </div>

            {/* Metrics/Stats Row Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="h-24 bg-white border border-gray-200 rounded-lg shadow-sm p-4">
                    <div className="h-4 bg-gray-100 rounded w-1/2 mb-2"></div>
                    <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                </div>
                <div className="h-24 bg-white border border-gray-200 rounded-lg shadow-sm p-4">
                    <div className="h-4 bg-gray-100 rounded w-1/2 mb-2"></div>
                    <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                </div>
                <div className="h-24 bg-white border border-gray-200 rounded-lg shadow-sm p-4">
                    <div className="h-4 bg-gray-100 rounded w-1/2 mb-2"></div>
                    <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                </div>
            </div>

            {/* Table Skeleton */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                {/* Toolbar */}
                <div className="p-4 border-b border-gray-100 flex gap-4">
                    <div className="h-10 bg-gray-100 rounded w-64"></div>
                    <div className="h-10 bg-gray-100 rounded w-24"></div>
                </div>

                {/* Table Header */}
                <div className="grid grid-cols-5 gap-4 p-4 bg-gray-50 border-b border-gray-100">
                    <div className="h-4 bg-gray-300 rounded"></div>
                    <div className="h-4 bg-gray-300 rounded"></div>
                    <div className="h-4 bg-gray-300 rounded"></div>
                    <div className="h-4 bg-gray-300 rounded"></div>
                    <div className="h-4 bg-gray-300 rounded"></div>
                </div>

                {/* Rows */}
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="grid grid-cols-5 gap-4 p-4 border-b border-gray-50 items-center">
                        <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-100 rounded w-1/2"></div>
                        <div className="h-4 bg-gray-100 rounded w-full"></div>
                        <div className="h-6 bg-gray-100 rounded w-16"></div>
                        <div className="h-4 bg-gray-100 rounded w-1/4"></div>
                    </div>
                ))}
            </div>

            <div className="text-center text-xs text-gray-400 mt-4">
                Loading Secure Financial Data...
            </div>
        </div>
    );
}
