import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiCreditCard, FiSmartphone, FiLock } from 'react-icons/fi';
import { formatCurrency, getAddMoneySuggestions } from '../utils/walletHelpers';

export default function AddMoneyModal({ isOpen, onClose, onAddMoney, isLoading }) {
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [customAmount, setCustomAmount] = useState(false);
  const suggestions = getAddMoneySuggestions();

  const handleSubmit = (e) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (numAmount > 0 && numAmount <= 50000) {
      onAddMoney(numAmount, paymentMethod);
    }
  };

  const handleSuggestionClick = (suggestedAmount) => {
    setAmount(suggestedAmount.toString());
    setCustomAmount(false);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex justify-between items-center p-5 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <span>💰</span> Add Money
            </h2>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100">
              <FiX className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-5 space-y-5">
            {/* Amount Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter Amount <span className="text-red-500">*</span>
              </label>
              
              {/* Suggestions */}
              <div className="flex flex-wrap gap-2 mb-3">
                {suggestions.map((sug) => (
                  <button
                    key={sug}
                    type="button"
                    onClick={() => handleSuggestionClick(sug)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      !customAmount && parseFloat(amount) === sug
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {formatCurrency(sug)}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setCustomAmount(true);
                    setAmount('');
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    customAmount ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Other
                </button>
              </div>

              {/* Custom Amount Input */}
              {(customAmount || (amount && !suggestions.includes(parseFloat(amount)))) && (
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount"
                    min="1"
                    max="50000"
                    className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              )}
              <p className="text-xs text-gray-400 mt-1">Min ₹1 • Max ₹50,000</p>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('UPI')}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${
                    paymentMethod === 'UPI'
                      ? 'border-orange-500 bg-orange-50 text-orange-600'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  <FiSmartphone className="w-5 h-5" /> UPI
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('CARD')}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${
                    paymentMethod === 'CARD'
                      ? 'border-orange-500 bg-orange-50 text-orange-600'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  <FiCreditCard className="w-5 h-5" /> Card
                </button>
              </div>
            </div>

            {/* Demo Mode Notice */}
            <div className="bg-yellow-50 rounded-xl p-3">
              <p className="text-xs text-yellow-700 flex items-center gap-1">
                <FiLock className="w-3 h-3" /> Demo Mode: No real payment will be processed
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!amount || isLoading}
                className="flex-1 bg-orange-500 text-white py-2 rounded-xl font-medium hover:bg-orange-600 disabled:opacity-50"
              >
                {isLoading ? 'Processing...' : `Add ${formatCurrency(parseFloat(amount) || 0)}`}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}