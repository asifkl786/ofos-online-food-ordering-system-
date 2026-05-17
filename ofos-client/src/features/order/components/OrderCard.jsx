import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import OrderStatusBadge from './OrderStatusBadge';
import { formatCurrency, formatDate } from '../utils/orderHelpers';
import { FiEye, FiRotateCcw, FiStar, FiMapPin } from 'react-icons/fi';

export default function OrderCard({ order, onCancel, onRate, showActions = true }) {
  const navigate = useNavigate();
  const itemCount = order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden"
    >
      {/* Restaurant Header */}
      <div className="p-5 pb-3 border-b border-gray-100">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🍕</span>
            <h3 className="font-semibold text-gray-800">{order.restaurant?.name}</h3>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>
        <p className="text-xs text-gray-400 mt-1">
          Order #{order.orderNumber} • {formatDate(order.createdAt)}
        </p>
      </div>
      
      {/* Order Items Preview */}
      <div className="p-5">
        <div className="space-y-2">
          {order.items?.slice(0, 2).map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span className="text-gray-600">
                {item.quantity}x {item.itemName}
              </span>
              <span className="text-gray-700">{formatCurrency(item.subtotal)}</span>
            </div>
          ))}
          {itemCount > 2 && (
            <p className="text-xs text-gray-400">+{itemCount - 2} more items</p>
          )}
        </div>
        
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex justify-between font-medium">
            <span>Total</span>
            <span className="text-orange-500">{formatCurrency(order.totalAmount)}</span>
          </div>
        </div>
        
        {/* Delivery Address */}
        {order.deliveryAddress && (
          <div className="mt-3 flex items-start gap-1 text-xs text-gray-400">
            <FiMapPin className="w-3 h-3 mt-0.5" />
            <span className="truncate">{order.deliveryAddress.streetAddress}, {order.deliveryAddress.city}</span>
          </div>
        )}
        
        {/* Action Buttons */}
        {showActions && (
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => navigate(`/orders/${order.id}`)}
              className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              <FiEye className="w-4 h-4" /> View Details
            </button>
            {order.status === 'DELIVERED' && (
              <button
                onClick={() => onRate?.(order)}
                className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-orange-50 text-orange-600 rounded-xl text-sm font-medium hover:bg-orange-100 transition-colors"
              >
                <FiStar className="w-4 h-4" /> Rate
              </button>
            )}
            {(order.status === 'PENDING' || order.status === 'CONFIRMED') && (
              <button
                onClick={() => onCancel?.(order.id)}
                className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-red-50 text-red-600 rounded-xl text-sm font-medium hover:bg-red-100 transition-colors"
              >
                <FiRotateCcw className="w-4 h-4" /> Cancel
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}