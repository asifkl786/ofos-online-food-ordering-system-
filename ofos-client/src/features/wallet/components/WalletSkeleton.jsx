export default function WalletSkeleton() {
  return (
    <div className="space-y-6">
      {/* Balance Card Skeleton */}
      <div className="bg-linear-to-r from-orange-500 to-red-500 rounded-2xl p-6 animate-pulse">
        <div className="flex justify-between mb-4">
          <div className="h-5 w-24 bg-white/20 rounded"></div>
          <div className="h-8 w-8 bg-white/20 rounded"></div>
        </div>
        <div className="h-10 w-32 bg-white/20 rounded mb-4"></div>
        <div className="grid grid-cols-2 gap-4">
          <div className="h-12 bg-white/20 rounded"></div>
          <div className="h-12 bg-white/20 rounded"></div>
        </div>
      </div>

      {/* Add Money Button Skeleton */}
      <div className="h-12 bg-gray-200 rounded-xl animate-pulse"></div>

      {/* Transactions Title Skeleton */}
      <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>

      {/* Transaction List Skeleton */}
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 w-32 bg-gray-200 rounded"></div>
                <div className="h-3 w-24 bg-gray-200 rounded mt-1"></div>
              </div>
              <div className="h-5 w-16 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}