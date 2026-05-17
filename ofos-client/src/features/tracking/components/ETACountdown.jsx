import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getEstimatedDeliveryTime } from '../utils/trackingHelpers';

export default function ETACountdown({ order }) {
  const [currentTime, setCurrentTime] = useState(new Date());
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute
    
    return () => clearInterval(timer);
  }, []);
  
  const estimatedTime = getEstimatedDeliveryTime(order?.status, order?.createdAt);
  const isDelivered = order?.status === 'DELIVERED';
  const isCancelled = order?.status === 'CANCELLED';
  
  if (isDelivered) {
    return (
      <div className="bg-green-50 rounded-2xl p-6 text-center">
        <div className="text-4xl mb-3">🎉</div>
        <h3 className="text-xl font-bold text-green-600">Order Delivered!</h3>
        <p className="text-green-500 mt-1">Thank you for ordering with us</p>
      </div>
    );
  }
  
  if (isCancelled) {
    return (
      <div className="bg-red-50 rounded-2xl p-6 text-center">
        <div className="text-4xl mb-3">❌</div>
        <h3 className="text-xl font-bold text-red-600">Order Cancelled</h3>
        <p className="text-red-500 mt-1">This order has been cancelled</p>
      </div>
    );
  }
  
  return (
    <motion.div 
      initial={{ scale: 0.95 }}
      animate={{ scale: 1 }}
      className="bg-linear-to-r from-orange-500 to-red-500 rounded-2xl p-6 text-white"
    >
      <div className="text-center">
        <div className="text-5xl mb-3">🚚</div>
        <h3 className="text-xl font-bold">Estimated Delivery Time</h3>
        <p className="text-3xl font-bold mt-2">{estimatedTime}</p>
        <p className="text-orange-100 text-sm mt-3">
          Your order is on the way!
        </p>
      </div>
    </motion.div>
  );
}