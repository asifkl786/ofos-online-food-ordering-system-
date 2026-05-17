import { useEffect, useState } from 'react';
import { useWallet } from '../hooks/useWallet';
import WalletBalance from '../components/WalletBalance';
import AddMoneyModal from '../components/AddMoneyModal';
import TransactionHistory from '../components/TransactionHistory';
import WalletSkeleton from '../components/WalletSkeleton';
import { FiPlus, FiArrowRight } from 'react-icons/fi';

export default function WalletPage() {
  const { 
    wallet, 
    balance, 
    transactions, 
    isLoading, 
    pagination,
    getWallet, 
    getTransactions, 
    addFunds,
    getBalance
  } = useWallet();
  
  const [showAddMoneyModal, setShowAddMoneyModal] = useState(false);

  useEffect(() => {
    getWallet();
    getTransactions();
    getBalance();
  }, []);

  const handleAddMoney = async (amount, paymentMethod) => {
    await addFunds(amount, paymentMethod).unwrap();
    getWallet();
    getTransactions();
    getBalance();
    setShowAddMoneyModal(false);
  };

  const handleLoadMore = () => {
    if (pagination.currentPage + 1 < pagination.totalPages) {
      getTransactions(pagination.currentPage + 1, pagination.pageSize);
    }
  };

  if (isLoading && !wallet) {
    return <WalletSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">👛 My Wallet</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your digital wallet</p>
        </div>

        {/* Balance Card */}
        <WalletBalance 
          balance={balance}
          totalCredited={wallet?.totalCredited}
          totalDebited={wallet?.totalDebited}
          isLoading={isLoading}
          onRefresh={() => {
            getWallet();
            getTransactions();
          }}
        />

        {/* Add Money Button */}
        <button
          onClick={() => setShowAddMoneyModal(true)}
          className="w-full mt-4 bg-white border-2 border-orange-500 text-orange-500 py-3 rounded-xl font-semibold hover:bg-orange-50 transition-colors flex items-center justify-center gap-2"
        >
          <FiPlus className="w-5 h-5" /> Add Money
        </button>

        {/* Transactions Section */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <span>📜</span> Transaction History
            </h2>
            <span className="text-xs text-gray-400">
              {pagination.totalElements} transactions
            </span>
          </div>

          <TransactionHistory transactions={transactions} isLoading={isLoading} />

          {/* Load More */}
          {!isLoading && transactions.length > 0 && pagination.currentPage + 1 < pagination.totalPages && (
            <div className="text-center mt-4">
              <button
                onClick={handleLoadMore}
                className="text-orange-500 text-sm font-medium hover:text-orange-600 flex items-center gap-1 mx-auto"
              >
                Load More <FiArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Add Money Modal */}
        <AddMoneyModal
          isOpen={showAddMoneyModal}
          onClose={() => setShowAddMoneyModal(false)}
          onAddMoney={handleAddMoney}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
