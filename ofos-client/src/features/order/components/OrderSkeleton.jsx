export default function OrderSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-md p-5 animate-pulse">
      <div className="flex justify-between items-center mb-3">
        <div className="h-6 w-32 bg-gray-200 rounded"></div>
        <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
      </div>
      <div className="h-4 w-40 bg-gray-200 rounded mb-4"></div>
      <div className="space-y-2">
        <div className="h-4 w-full bg-gray-200 rounded"></div>
        <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
      </div>
      <div className="mt-4 pt-3 border-t border-gray-100">
        <div className="flex justify-between">
          <div className="h-5 w-20 bg-gray-200 rounded"></div>
          <div className="h-5 w-16 bg-gray-200 rounded"></div>
        </div>
      </div>
      <div className="flex gap-2 mt-4">
        <div className="h-10 flex-1 bg-gray-200 rounded-xl"></div>
        <div className="h-10 flex-1 bg-gray-200 rounded-xl"></div>
      </div>
    </div>
  );
}