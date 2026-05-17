import { useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiHome, FiPackage } from 'react-icons/fi';
import { formatCurrency } from '../utils/paymentHelpers';

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const location = useLocation();

  const order = useMemo(() => {
    if (location.state?.order) return location.state.order;
    const cachedOrder = sessionStorage.getItem('lastPaidOrder');
    return cachedOrder ? JSON.parse(cachedOrder) : null;
  }, [location.state]);

  useEffect(() => {
    if (location.state?.order) {
      sessionStorage.setItem('lastPaidOrder', JSON.stringify(location.state.order));
    }
  }, [location.state]);

  const trackOrder = () => {
    if (order?.id) {
      navigate(`/orders/${order.id}`);
      return;
    }
    navigate('/orders');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.2 }}
          className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <FiCheckCircle className="w-10 h-10 text-green-500" />
        </motion.div>
        
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Payment Successful!</h1>
        <p className="text-gray-500 mb-6">Your order has been placed successfully</p>
        
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <p className="text-sm text-gray-600">Order Number</p>
          <p className="text-lg font-bold text-orange-500">{order?.orderNumber || 'Order details loading...'}</p>
          <p className="text-sm text-gray-500 mt-2">
            Amount Paid: <span className="font-semibold text-gray-800">{formatCurrency(order?.totalAmount || 0)}</span>
          </p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={trackOrder}
            className="flex-1 bg-orange-500 text-white py-2 rounded-xl font-medium hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
          >
            <FiPackage /> Track Order
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-xl font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
          >
            <FiHome /> Home
          </button>
        </div>
      </motion.div>
    </div>
  );
}