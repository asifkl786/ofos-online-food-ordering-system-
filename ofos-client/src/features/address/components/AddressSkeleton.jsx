export default function AddressSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 animate-pulse">
      <div className="flex items-center justify-between mb-3">
        <div className="h-8 w-24 bg-gray-200 rounded-full"></div>
        <div className="h-5 w-16 bg-gray-200 rounded-full"></div>
      </div>
      <div className="space-y-2">
        <div className="h-5 w-32 bg-gray-200 rounded"></div>
        <div className="h-4 w-full bg-gray-200 rounded"></div>
        <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
        <div className="h-4 w-28 bg-gray-200 rounded"></div>
      </div>
      <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-gray-100">
        <div className="h-8 w-16 bg-gray-200 rounded"></div>
        <div className="h-8 w-16 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
}