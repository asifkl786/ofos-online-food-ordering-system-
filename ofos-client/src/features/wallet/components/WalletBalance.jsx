import { FiEye, FiEyeOff, FiTrendingUp, FiRefreshCw } from 'react-icons/fi';
import { formatCurrency } from '../utils/walletHelpers';
import { useState } from 'react';

export default function WalletBalance({ balance, totalCredited, totalDebited, isLoading, onRefresh }) {
  const [showBalance, setShowBalance] = useState(true);

  return (
    <div className="bg-linear-to-r from-orange-500 to-red-500 rounded-2xl p-6 text-white">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">👛</span>
          <span className="font-semibold">My Wallet</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowBalance(!showBalance)}
            className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
          >
            {showBalance ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
          </button>
          <button
            onClick={onRefresh}
            className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
          >
            <FiRefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Balance Amount */}
      <div className="mb-4">
        <p className="text-orange-100 text-sm mb-1">Total Balance</p>
        <p className="text-3xl md:text-4xl font-bold">
          {showBalance ? formatCurrency(balance) : '••••••'}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-orange-400">
        <div>
          <p className="text-orange-100 text-xs">Total Credited</p>
          <p className="text-lg font-semibold">{formatCurrency(totalCredited || 0)}</p>
        </div>
        <div>
          <p className="text-orange-100 text-xs">Total Debited</p>
          <p className="text-lg font-semibold">{formatCurrency(totalDebited || 0)}</p>
        </div>
      </div>
    </div>
  );
}