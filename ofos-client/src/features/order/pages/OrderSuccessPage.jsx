import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { formatCurrency, formatDate, getEstimatedDeliveryTime } from '../utils/orderHelpers';
import { FiCheckCircle, FiTruck, FiHome, FiPrinter } from 'react-icons/fi';

export default function OrderSuccessPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const order = location.state?.order;

  useEffect(() => {
    if (!order) {
      navigate('/');
    }
  }, [order, navigate]);

  if (!order) return null;

  const estimatedTime = getEstimatedDeliveryTime();

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Success Animation */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="text-center mb-6"
        >
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <FiCheckCircle className="w-12 h-12 text-green-500" />
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-2xl font-bold text-gray-800">Order Placed Successfully! 🎉</h1>
          <p className="text-gray-500 mt-2">Thank you for your order</p>
        </motion.div>
        
        {/* Order Details Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-6"
        >
          <div className="text-center pb-4 border-b border-gray-100">
            <p className="text-sm text-gray-500">Order Number</p>
            <p className="text-xl font-bold text-orange-500">{order.orderNumber}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 py-4">
            <div>
              <p className="text-xs text-gray-400">Order Date</p>
              <p className="font-medium">{formatDate(order.createdAt)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Total Amount</p>
              <p className="font-medium text-orange-500">{formatCurrency(order.totalAmount)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Payment Method</p>
              <p className="font-medium">{order.paymentMethod || 'Cash on Delivery'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Est. Delivery</p>
              <p className="font-medium flex items-center gap-1">
                <FiTruck className="w-3 h-3" /> {estimatedTime}
              </p>
            </div>
          </div>
        </motion.div>
        
        {/* Delivery Address */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-6"
        >
          <h3 className="font-semibold text-gray-800 mb-3">Delivery Address</h3>
          <p className="text-gray-600">
            {order.deliveryAddress?.streetAddress}, {order.deliveryAddress?.city}<br />
            {order.deliveryAddress?.state} - {order.deliveryAddress?.zipCode}
          </p>
          {order.deliveryAddress?.phoneNumber && (
            <p className="text-sm text-gray-500 mt-2">📞 {order.deliveryAddress.phoneNumber}</p>
          )}
        </motion.div>
        
        {/* Order Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-8"
        >
          <h3 className="font-semibold text-gray-800 mb-3">Order Items</h3>
          <div className="space-y-2">
            {order.items?.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-gray-600">
                  {item.quantity}x {item.itemName}
                </span>
                <span className="text-gray-700">{formatCurrency(item.subtotal)}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex justify-between font-medium">
              <span>Total</span>
              <span className="text-orange-500">{formatCurrency(order.totalAmount)}</span>
            </div>
          </div>
        </motion.div>
        
        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={() => navigate(`/orders/${order.id}`)}
            className="flex-1 bg-orange-500 text-white py-3 rounded-xl font-semibold hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
          >
            <FiTruck className="w-5 h-5" /> Track Order
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
          >
            <FiHome className="w-5 h-5" /> Continue Shopping
          </button>
        </div>
        
        {/* Print Button */}
        <button
          onClick={() => window.print()}
          className="w-full mt-4 text-gray-400 text-sm flex items-center justify-center gap-1 hover:text-gray-600 transition-colors"
        >
          <FiPrinter className="w-4 h-4" /> Print Receipt
        </button>
      </div>
    </div>
  );
}