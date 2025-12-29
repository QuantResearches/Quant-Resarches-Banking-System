export default function Loading() {
    return (
        <div className="space-y-6">
            {/* Page Header Static Placeholder */}
            <div className="flex justify-between items-center">
                <div className="h-8 bg-gray-100 rounded w-48 border border-gray-200"></div>
                <div className="h-10 bg-gray-100 rounded w-32 border border-gray-200"></div>
            </div>

            {/* Metrics/Stats Row Static */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-24 bg-white border border-gray-200 rounded-lg p-4 flex flex-col justify-center">
                        <div className="h-4 bg-gray-50 rounded w-1/2 mb-2"></div>
                        <div className="h-8 bg-gray-100 rounded w-3/4"></div>
                    </div>
                ))}
            </div>

            {/* Table Static Placeholder */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                {/* Toolbar */}
                <div className="p-4 border-b border-gray-100 flex gap-4 bg-gray-50/50">
                    <div className="h-10 bg-white border border-gray-200 rounded w-64"></div>
                    <div className="h-10 bg-white border border-gray-200 rounded w-24"></div>
                </div>

                {/* Table Header */}
                <div className="grid grid-cols-5 gap-4 p-4 bg-gray-50 border-b border-gray-100">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                </div>

                {/* Rows - Static Repeating Pattern */}
                <div className="divide-y divide-gray-50">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="grid grid-cols-5 gap-4 p-4 items-center">
                            <div className="h-4 bg-gray-50 rounded w-3/4"></div>
                            <div className="h-4 bg-gray-50 rounded w-1/2"></div>
                            <div className="h-4 bg-gray-50 rounded w-full"></div>
                            <div className="h-6 bg-gray-50 rounded w-16"></div>
                            <div className="h-4 bg-gray-50 rounded w-1/4"></div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex items-center gap-2 mt-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                Loading secure data...
            </div>
        </div>
    );
}
