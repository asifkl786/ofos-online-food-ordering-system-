// Format currency
export const formatCurrency = (amount) => {
  if (!amount) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Format date
export const formatWalletDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Get transaction type config
export const getTransactionConfig = (type) => {
  if (type === 'CREDIT') {
    return { 
      label: 'Credited', 
      color: 'text-green-600', 
      bgColor: 'bg-green-100',
      icon: '💰',
      sign: '+'
    };
  }
  return { 
    label: 'Debited', 
    color: 'text-red-600', 
    bgColor: 'bg-red-100',
    icon: '💸',
    sign: '-'
  };
};

// Get transaction mode icon
export const getTransactionModeIcon = (mode) => {
  const modes = {
    UPI: '📱',
    CARD: '💳',
    NET_BANKING: '🏦',
    REFUND: '↩️',
    ORDER_PAYMENT: '🍔',
    CASHBACK: '🎁',
    BONUS: '⭐',
  };
  return modes[mode] || '💰';
};

// Get random suggestions for add money
export const getAddMoneySuggestions = () => {
  return [100, 200, 500, 1000, 2000, 5000];
};