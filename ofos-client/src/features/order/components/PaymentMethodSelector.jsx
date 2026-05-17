import { motion } from 'framer-motion';

const paymentMethods = [
  { id: 'CASH_ON_DELIVERY', name: 'Cash on Delivery', description: 'Pay when you receive order', icon: 'Rs', recommended: true },
  { id: 'DEBIT_CARD', name: 'Credit/Debit Card', description: 'Secure payment via card', icon: 'CC' },
  { id: 'UPI', name: 'UPI', description: 'Google Pay, PhonePe, Paytm', icon: 'UPI' },
  { id: 'SBI_NET_BANKING', name: 'SBI Net Banking', description: 'Pay securely from SBI account', icon: 'SBI' },
  { id: 'OTHER_BANK_NET_BANKING', name: 'Other Bank Net Banking', description: 'HDFC, ICICI, Axis and more', icon: 'NB' },
  { id: 'WALLET', name: 'Wallet', description: 'Pay using OFOS wallet', icon: 'W' },
];

export default function PaymentMethodSelector({ selectedMethod, onSelect }) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">Payment Method</label>
      <div className="space-y-3">
        {paymentMethods.map((method) => (
          <motion.div
            key={method.id}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => onSelect(method.id)}
            className={`
              cursor-pointer rounded-xl border-2 p-4 transition-all duration-200
              ${selectedMethod === method.id
                ? 'border-orange-500 bg-orange-50'
                : 'border-gray-200 hover:border-orange-200'
              }
            `}
          >
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-xs font-bold text-slate-700">
                {method.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-gray-800">{method.name}</h4>
                  {method.recommended && (
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">
                      Recommended
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500">{method.description}</p>
              </div>
              <div className={`
                flex h-5 w-5 items-center justify-center rounded-full border-2
                ${selectedMethod === method.id
                  ? 'border-orange-500 bg-orange-500'
                  : 'border-gray-300'
                }
              `}>
                {selectedMethod === method.id && (
                  <div className="h-2 w-2 rounded-full bg-white" />
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
