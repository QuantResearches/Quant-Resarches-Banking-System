export default function Loading() {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="h-8 bg-gray-200 w-1/4"></div>

            <div className="bg-white border border-gray-200 p-6">
                <div className="h-6 bg-gray-200 w-1/2 mb-4"></div>
                <div className="space-y-3">
                    <div className="h-4 bg-gray-200 w-full"></div>
                    <div className="h-4 bg-gray-200 w-full"></div>
                    <div className="h-4 bg-gray-200 w-3/4"></div>
                </div>
            </div>

            <div className="bg-white border border-gray-200 p-6">
                <div className="h-6 bg-gray-200 w-1/3 mb-4"></div>
                <div className="h-32 bg-gray-200 w-full"></div>
            </div>
        </div>
    );
}
