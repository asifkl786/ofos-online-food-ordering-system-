// Format date and time
export const formatDateTime = (dateString) => {
  if (!dateString) return 'Pending';
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

// Get order status color and icon
export const getOrderStatusConfig = (status) => {
  const statuses = {
    PENDING: { 
      label: 'Order Placed', 
      color: 'bg-yellow-100 text-yellow-700', 
      icon: '📝',
      progress: 0
    },
    CONFIRMED: { 
      label: 'Confirmed', 
      color: 'bg-blue-100 text-blue-700', 
      icon: '✅',
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
  };
  return statuses[status] || statuses.PENDING;
};

// Get status steps for timeline
export const getStatusSteps = (currentStatus) => {
  const allSteps = [
    { key: 'PENDING', label: 'Order Placed', icon: '📝', description: 'Your order has been placed' },
    { key: 'CONFIRMED', label: 'Confirmed', icon: '✅', description: 'Restaurant has confirmed your order' },
    { key: 'PREPARING', label: 'Preparing', icon: '🍳', description: 'Your food is being prepared' },
    { key: 'READY_FOR_PICKUP', label: 'Ready for Pickup', icon: '📦', description: 'Food is ready for pickup' },
    { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: '🚚', description: 'Delivery partner is on the way' },
    { key: 'DELIVERED', label: 'Delivered', icon: '✅', description: 'Order delivered successfully' },
  ];

  const currentIndex = allSteps.findIndex(step => step.key === currentStatus);
  
  return allSteps.map((step, index) => ({
    ...step,
    isCompleted: index <= currentIndex,
    isCurrent: index === currentIndex,
    isUpcoming: index > currentIndex,
  }));
};

// Calculate estimated delivery time (mock)
export const getEstimatedDeliveryTime = (status, createdAt) => {
  if (status === 'DELIVERED') return 'Delivered';
  if (status === 'CANCELLED') return 'Cancelled';
  
  const baseTime = new Date(createdAt);
  const minutes = {
    PENDING: 45,
    CONFIRMED: 40,
    PREPARING: 30,
    READY_FOR_PICKUP: 20,
    OUT_FOR_DELIVERY: 15,
  };
  
  const remainingMinutes = minutes[status] || 45;
  const eta = new Date(baseTime.getTime() + remainingMinutes * 60000);
  
  return eta.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Get random delivery partner (mock)
export const getMockDeliveryPartner = () => {
  const partners = [
    { name: 'Rajesh Kumar', phone: '+91 98765 43210', rating: 4.8, deliveries: 245, avatar: '🚴', vehicle: 'Bike' },
    { name: 'Amit Singh', phone: '+91 98765 43211', rating: 4.9, deliveries: 312, avatar: '🛵', vehicle: 'Scooter' },
    { name: 'Vikram Sharma', phone: '+91 98765 43212', rating: 4.7, deliveries: 189, avatar: '🚗', vehicle: 'Car' },
  ];
  return partners[Math.floor(Math.random() * partners.length)];
};

// Format duration
export const formatDuration = (minutes) => {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours} hr ${mins} min`;
};

// Get progress percentage
export const getProgressPercentage = (status) => {
  const progress = {
    PENDING: 0,
    CONFIRMED: 20,
    PREPARING: 40,
    READY_FOR_PICKUP: 60,
    OUT_FOR_DELIVERY: 80,
    DELIVERED: 100,
  };
  return progress[status] || 0;
};

export const formatCurrency = (amount) => {
  if (amount == null) return '₹0';
  
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount);
};

// This method fix by claude ai
// Seed with orderId so the same order always shows same partner
// export const getMockDeliveryPartner = (orderId) => {
//   const index = orderId % partners.length;
//   return partners[index];
// };