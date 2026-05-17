import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiXCircle, FiRefreshCw, FiHome } from 'react-icons/fi';

export default function PaymentFailed({ order, onRetry }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center"
      >
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FiXCircle className="w-10 h-10 text-red-500" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Payment Failed! 😔</h1>
        <p className="text-gray-500 mb-6">Something went wrong. Please try again.</p>
        
        <div className="bg-yellow-50 rounded-xl p-4 mb-6">
          <p className="text-sm text-yellow-700">Possible reasons:</p>
          <ul className="text-xs text-yellow-600 mt-2 space-y-1">
            <li>• Insufficient balance</li>
            <li>• Incorrect card details</li>
            <li>• Network issue</li>
          </ul>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={onRetry}
            className="flex-1 bg-orange-500 text-white py-2 rounded-xl font-medium hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
          >
            <FiRefreshCw /> Try Again
          </button>
          <button
            onClick={() => navigate('/cart')}
            className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-xl font-medium hover:bg-gray-200 transition-colors"
          >
            Back to Cart
          </button>
        </div>
      </motion.div>
    </div>
  );
}