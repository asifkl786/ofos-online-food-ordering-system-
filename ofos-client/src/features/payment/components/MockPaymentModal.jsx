import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiCreditCard, FiSmartphone, FiLock, FiCalendar, FiHome } from 'react-icons/fi';
import { formatCurrency, formatCardNumber, formatExpiry, validateCardNumber, validateExpiry, validateCVV } from '../utils/paymentHelpers';

const paymentMethods = [
  { id: 'DEBIT_CARD', label: 'Card', short: 'CC' },
  { id: 'UPI', label: 'UPI', short: 'UPI' },
  { id: 'SBI_NET_BANKING', label: 'SBI Net Banking', short: 'SBI' },
  { id: 'OTHER_BANK_NET_BANKING', label: 'Other Bank', short: 'NB' },
  { id: 'WALLET', label: 'Wallet', short: 'W' },
  { id: 'CASH_ON_DELIVERY', label: 'Cash on Delivery', short: 'COD' },
];

const bankMessages = {
  SBI_NET_BANKING: {
    title: 'SBI Net Banking',
    description: 'You will be redirected to the SBI demo banking page for secure authorization.',
  },
  OTHER_BANK_NET_BANKING: {
    title: 'Other Bank Net Banking',
    description: 'Use HDFC, ICICI, Axis, PNB or any supported bank in demo mode.',
  },
};

export default function MockPaymentModal({ isOpen, onClose, amount, orderId, initialPaymentMethod = 'DEBIT_CARD', onPaymentComplete }) {
  const [paymentMethod, setPaymentMethod] = useState(initialPaymentMethod);
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    cardNumber: '',
    cardName: '',
    expiry: '',
    cvv: '',
    upiId: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) setPaymentMethod(initialPaymentMethod);
  }, [initialPaymentMethod, isOpen]);

  const handleCardInputChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === 'cardNumber') formattedValue = formatCardNumber(value);
    if (name === 'expiry') formattedValue = formatExpiry(value);

    setFormData((prev) => ({ ...prev, [name]: formattedValue }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (paymentMethod === 'DEBIT_CARD') {
      if (!validateCardNumber(formData.cardNumber)) newErrors.cardNumber = 'Enter valid 16-digit card number';
      if (!formData.cardName) newErrors.cardName = 'Cardholder name is required';
      if (!validateExpiry(formData.expiry)) newErrors.expiry = 'Enter valid expiry (MM/YY)';
      if (!validateCVV(formData.cvv)) newErrors.cvv = 'Enter valid CVV';
    }

    if (paymentMethod === 'UPI' && !formData.upiId) {
      newErrors.upiId = 'Enter UPI ID (e.g., name@okhdfcbank)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsProcessing(true);
    setTimeout(async () => {
      const paymentDetails = {
        method: paymentMethod,
        amount,
        ...formData,
      };

      await onPaymentComplete(orderId, paymentDetails);
      setIsProcessing(false);
      onClose();
    }, 1200);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
          className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-6 py-4">
            <h2 className="text-xl font-bold text-gray-800">Mock Payment</h2>
            <button type="button" onClick={onClose} className="rounded-lg p-2 transition-colors hover:bg-gray-100">
              <FiX className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          <div className="border-b border-yellow-100 bg-yellow-50 p-4">
            <p className="text-sm text-yellow-700">Demo Mode | No real payment will be processed</p>
          </div>

          <div className="bg-orange-50 p-6 text-center">
            <p className="text-sm text-gray-600">Amount to Pay</p>
            <p className="text-3xl font-bold text-orange-500">{formatCurrency(amount)}</p>
          </div>

          <div className="p-6">
            <div className="mb-6 grid grid-cols-2 gap-3">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setPaymentMethod(method.id)}
                  className={`flex min-h-[58px] items-center gap-3 rounded-xl border-2 px-4 py-3 text-left transition-all ${
                    paymentMethod === method.id
                      ? 'border-orange-500 bg-orange-50 text-orange-600'
                      : 'border-gray-200 text-gray-600 hover:border-orange-200 hover:bg-orange-50/50'
                  }`}
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-700">
                    {method.short}
                  </span>
                  <span className="text-sm font-semibold leading-tight">{method.label}</span>
                </button>
              ))}
            </div>

            {paymentMethod === 'DEBIT_CARD' && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Card Number</label>
                  <div className="relative">
                    <FiCreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      name="cardNumber"
                      value={formData.cardNumber}
                      onChange={handleCardInputChange}
                      placeholder="1234 5678 9012 3456"
                      className={`w-full rounded-xl border py-2 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                        errors.cardNumber ? 'border-red-500 bg-red-50' : 'border-gray-200'
                      }`}
                    />
                  </div>
                  {errors.cardNumber && <p className="mt-1 text-xs text-red-500">{errors.cardNumber}</p>}
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Cardholder Name</label>
                  <input
                    type="text"
                    name="cardName"
                    value={formData.cardName}
                    onChange={handleCardInputChange}
                    placeholder="ASIF KHAN"
                    className={`w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                      errors.cardName ? 'border-red-500 bg-red-50' : 'border-gray-200'
                    }`}
                  />
                  {errors.cardName && <p className="mt-1 text-xs text-red-500">{errors.cardName}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Expiry Date</label>
                    <div className="relative">
                      <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        name="expiry"
                        value={formData.expiry}
                        onChange={handleCardInputChange}
                        placeholder="MM/YY"
                        className={`w-full rounded-xl border py-2 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                          errors.expiry ? 'border-red-500 bg-red-50' : 'border-gray-200'
                        }`}
                      />
                    </div>
                    {errors.expiry && <p className="mt-1 text-xs text-red-500">{errors.expiry}</p>}
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">CVV</label>
                    <div className="relative">
                      <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="password"
                        name="cvv"
                        value={formData.cvv}
                        onChange={handleCardInputChange}
                        placeholder="123"
                        className={`w-full rounded-xl border py-2 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                          errors.cvv ? 'border-red-500 bg-red-50' : 'border-gray-200'
                        }`}
                      />
                    </div>
                    {errors.cvv && <p className="mt-1 text-xs text-red-500">{errors.cvv}</p>}
                  </div>
                </div>
              </form>
            )}

            {paymentMethod === 'UPI' && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">UPI ID</label>
                  <div className="relative">
                    <FiSmartphone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      name="upiId"
                      value={formData.upiId}
                      onChange={handleCardInputChange}
                      placeholder="username@okhdfcbank"
                      className={`w-full rounded-xl border py-2 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                        errors.upiId ? 'border-red-500 bg-red-50' : 'border-gray-200'
                      }`}
                    />
                  </div>
                  {errors.upiId && <p className="mt-1 text-xs text-red-500">{errors.upiId}</p>}
                </div>
                <div className="rounded-xl bg-gray-50 p-4 text-sm text-gray-600">
                  Demo UPI IDs: name@okhdfcbank, name@ybl, name@axl
                </div>
              </form>
            )}

            {(paymentMethod === 'SBI_NET_BANKING' || paymentMethod === 'OTHER_BANK_NET_BANKING') && (
              <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-5">
                <div className="mb-2 flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-indigo-600">
                    <FiHome />
                  </span>
                  <div>
                    <p className="font-semibold text-gray-800">{bankMessages[paymentMethod].title}</p>
                    <p className="text-xs text-gray-500">Demo authorization</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600">{bankMessages[paymentMethod].description}</p>
              </div>
            )}

            {(paymentMethod === 'CASH_ON_DELIVERY' || paymentMethod === 'WALLET') && (
              <div className="rounded-xl bg-gray-50 p-6 text-center">
                {paymentMethod === 'CASH_ON_DELIVERY' && (
                  <>
                    <p className="text-gray-600">Pay when you receive your order</p>
                    <p className="mt-2 text-xs text-gray-400">Cash on Delivery available</p>
                  </>
                )}
                {paymentMethod === 'WALLET' && (
                  <>
                    <p className="text-gray-600">Pay using your OFOS wallet</p>
                    <p className="mt-2 text-xs text-gray-400">Wallet balance will be checked in demo mode</p>
                  </>
                )}
              </div>
            )}

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isProcessing}
              className={`mt-6 w-full rounded-xl py-3 font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                paymentMethod === 'CASH_ON_DELIVERY' ? 'bg-green-500 hover:bg-green-600' : 'bg-orange-500 hover:bg-orange-600'
              }`}
            >
              {isProcessing ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Processing...
                </span>
              ) : paymentMethod === 'CASH_ON_DELIVERY' ? (
                'Place Order (COD)'
              ) : (
                `Pay ${formatCurrency(amount)}`
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
