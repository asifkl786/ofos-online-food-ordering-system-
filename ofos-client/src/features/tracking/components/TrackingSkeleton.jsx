export default function TrackingSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="animate-pulse">
          {/* Header Skeleton */}
          <div className="h-8 w-48 bg-gray-200 rounded mb-6"></div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column Skeleton */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl p-6">
                <div className="h-6 w-32 bg-gray-200 rounded mb-4"></div>
                <div className="space-y-4">
                  <div className="h-16 bg-gray-100 rounded"></div>
                  <div className="h-16 bg-gray-100 rounded"></div>
                  <div className="h-16 bg-gray-100 rounded"></div>
                </div>
              </div>
            </div>
            
            {/* Right Column Skeleton */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6">
                <div className="h-32 bg-gray-100 rounded"></div>
              </div>
              <div className="bg-white rounded-2xl p-6">
                <div className="h-40 bg-gray-100 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}