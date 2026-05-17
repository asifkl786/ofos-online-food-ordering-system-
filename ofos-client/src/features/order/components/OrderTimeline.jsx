import { motion } from 'framer-motion';
import { getOrderStatusConfig, formatDate } from '../utils/orderHelpers';

export default function OrderTimeline({ order }) {
  const statuses = [
    { key: 'PENDING', label: 'Order Placed', icon: '📝' },
    { key: 'CONFIRMED', label: 'Confirmed', icon: '✓' },
    { key: 'PREPARING', label: 'Preparing', icon: '🍳' },
    { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: '🚚' },
    { key: 'DELIVERED', label: 'Delivered', icon: '✅' },
  ];

  const currentStatusIndex = statuses.findIndex(s => s.key === order.status);
  const orderStatusConfig = getOrderStatusConfig(order.status);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-md">
      <h3 className="font-semibold text-gray-800 mb-6">Order Timeline</h3>
      
      <div className="relative">
        {/* Vertical Line */}
        <div className="absolute left-5 top-8 bottom-8 w-0.5 bg-gray-200" />
        
        <div className="space-y-6">
          {statuses.map((status, index) => {
            const isCompleted = index <= currentStatusIndex;
            const isCurrent = index === currentStatusIndex;
            const statusDate = order[status.key.toLowerCase() + 'At'];
            
            return (
              <motion.div
                key={status.key}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative flex gap-4"
              >
                {/* Timeline Icon */}
                <div className={`
                  relative z-10 w-10 h-10 rounded-full flex items-center justify-center
                  transition-all duration-300
                  ${isCompleted 
                    ? 'bg-orange-500 text-white shadow-md' 
                    : 'bg-gray-200 text-gray-400'
                  }
                  ${isCurrent ? 'ring-4 ring-orange-200' : ''}
                `}>
                  {isCompleted && index < currentStatusIndex ? '✓' : status.icon}
                </div>
                
                {/* Timeline Content */}
                <div className="flex-1 pb-4">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <h4 className={`font-medium ${isCompleted ? 'text-gray-800' : 'text-gray-400'}`}>
                      {status.label}
                    </h4>
                    {statusDate && (
                      <span className="text-xs text-gray-400">
                        {formatDate(statusDate)}
                      </span>
                    )}
                  </div>
                  {isCurrent && (
                    <p className="text-sm text-orange-500 mt-1">
                      {orderStatusConfig.label} • Estimated delivery soon
                    </p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}