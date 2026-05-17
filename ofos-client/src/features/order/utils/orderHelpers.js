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
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Get order status color and icon
export const getOrderStatusConfig = (status) => {
  const statuses = {
    PENDING: { 
      label: 'Pending', 
      color: 'bg-yellow-100 text-yellow-700', 
      icon: '⏳',
      progress: 10
    },
    CONFIRMED: { 
      label: 'Confirmed', 
      color: 'bg-blue-100 text-blue-700', 
      icon: '✓',
      progress: 25
    },
    PREPARING: { 
      label: 'Preparing', 
      color: 'bg-purple-100 text-purple-700', 
      icon: '🍳',
      progress: 50
    },
    READY_FOR_PICKUP: { 
      label: 'Ready for Pickup', 
      color: 'bg-indigo-100 text-indigo-700', 
      icon: '📦',
      progress: 75
    },
    OUT_FOR_DELIVERY: { 
      label: 'Out for Delivery', 
      color: 'bg-orange-100 text-orange-700', 
      icon: '🚚',
      progress: 90
    },
    DELIVERED: { 
      label: 'Delivered', 
      color: 'bg-green-100 text-green-700', 
      icon: '✅',
      progress: 100
    },
    CANCELLED: { 
      label: 'Cancelled', 
      color: 'bg-red-100 text-red-700', 
      icon: '❌',
      progress: 0
    },
    REFUNDED: { 
      label: 'Refunded', 
      color: 'bg-gray-100 text-gray-700', 
      icon: '💰',
      progress: 0
    },
  };
  return statuses[status] || statuses.PENDING;
};

// Get payment method icon
export const getPaymentMethodIcon = (method) => {
  const methods = {
    COD: '💵',
    CARD: '💳',
    UPI: '📱',
    WALLET: '👛',
    NET_BANKING: '🏦',
  };
  return methods[method] || '💳';
};

// Calculate estimated delivery time
export const getEstimatedDeliveryTime = () => {
  const now = new Date();
  const minutes = 45 + Math.floor(Math.random() * 15);
  const estimatedTime = new Date(now.getTime() + minutes * 60000);
  return estimatedTime.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Generate order timeline steps
export const getOrderTimelineSteps = (status, createdAt, deliveredAt) => {
  const steps = [
    { key: 'ORDERED', label: 'Order Placed', icon: '📝', date: createdAt },
    { key: 'CONFIRMED', label: 'Confirmed', icon: '✓', date: null },
    { key: 'PREPARING', label: 'Preparing', icon: '🍳', date: null },
    { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: '🚚', date: null },
    { key: 'DELIVERED', label: 'Delivered', icon: '✅', date: deliveredAt },
  ];
  return steps;
};