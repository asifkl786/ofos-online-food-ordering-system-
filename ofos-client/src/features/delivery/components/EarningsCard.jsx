import { formatCurrency } from '../utils/deliveryHelpers';
import { FiTrendingUp } from 'react-icons/fi';

export default function EarningsCard({ earnings }) {
  if (!earnings) return null;

  const totalEarnings = earnings.totalEarnings ?? earnings.total ?? 0;
  const totalDeliveries = earnings.totalDeliveries ?? earnings.deliveries ?? 0;
  const monthlyEarnings = earnings.thisMonth ?? earnings.monthlyEarnings ?? 0;
  const rating = Number(earnings.averageRating ?? earnings.rating ?? 0);

  return (
    <div className="bg-white rounded-2xl shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <FiTrendingUp className="text-orange-500" /> Earnings Overview
      </h3>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-orange-50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-orange-500">{formatCurrency(totalEarnings)}</p>
          <p className="text-xs text-gray-500 mt-1">Total Earnings</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-blue-500">{totalDeliveries}</p>
          <p className="text-xs text-gray-500 mt-1">Total Deliveries</p>
        </div>
        <div className="bg-green-50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-green-500">{formatCurrency(monthlyEarnings)}</p>
          <p className="text-xs text-gray-500 mt-1">This Month</p>
        </div>
        <div className="bg-purple-50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-purple-500">{rating.toFixed(1)} Star</p>
          <p className="text-xs text-gray-500 mt-1">Rating</p>
        </div>
      </div>
    </div>
  );
}
