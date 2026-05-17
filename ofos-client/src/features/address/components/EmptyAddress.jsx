import { FiMapPin } from 'react-icons/fi';

export default function EmptyAddress() {
  return (
    <div className="text-center py-12">
      <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <FiMapPin className="w-10 h-10 text-orange-500" />
      </div>
      <h3 className="text-lg font-semibold text-gray-700 mb-2">No Addresses Added</h3>
      <p className="text-gray-500 text-sm mb-6">
        You haven't added any delivery addresses yet.
      </p>
    </div>
  );
}