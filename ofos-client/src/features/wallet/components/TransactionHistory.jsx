import TransactionCard from './TransactionCard';
import { FiClock } from 'react-icons/fi';

export default function TransactionHistory({ transactions, isLoading }) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 w-32 bg-gray-200 rounded"></div>
                <div className="h-3 w-24 bg-gray-200 rounded mt-1"></div>
              </div>
              <div className="h-5 w-16 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-5xl mb-3">📭</div>
        <h3 className="text-lg font-semibold text-gray-700">No Transactions Yet</h3>
        <p className="text-gray-500 text-sm mt-1">Add money to your wallet to see transactions</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {transactions.map((transaction) => (
        <TransactionCard key={transaction.id} transaction={transaction} />
      ))}
    </div>
  );
}