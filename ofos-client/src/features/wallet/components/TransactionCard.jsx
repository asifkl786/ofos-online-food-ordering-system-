import { formatCurrency, formatWalletDate, getTransactionConfig, getTransactionModeIcon } from '../utils/walletHelpers';

export default function TransactionCard({ transaction }) {
  const config = getTransactionConfig(transaction.transactionType);
  const modeIcon = getTransactionModeIcon(transaction.mode);
  const isCredit = transaction.transactionType === 'CREDIT';

  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 ${config.bgColor} rounded-full flex items-center justify-center text-xl`}>
          {config.icon}
        </div>
        <div>
          <p className="font-medium text-gray-800">{transaction.description || transaction.mode}</p>
          <p className="text-xs text-gray-400 flex items-center gap-2 mt-1">
            <span>{formatWalletDate(transaction.transactionDate)}</span>
            <span>•</span>
            <span className="flex items-center gap-1">{modeIcon} {transaction.mode}</span>
            {transaction.orderNumber && (
              <>
                <span>•</span>
                <span>Order #{transaction.orderNumber}</span>
              </>
            )}
          </p>
        </div>
      </div>
      <div className={`text-right font-semibold ${config.color}`}>
        <p>{config.sign} {formatCurrency(transaction.amount)}</p>
        <p className="text-xs text-gray-400 mt-1">₹{transaction.closingBalance?.toFixed(2)}</p>
      </div>
    </div>
  );
}