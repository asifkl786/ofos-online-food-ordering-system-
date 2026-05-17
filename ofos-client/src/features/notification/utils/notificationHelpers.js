// Format notification time (e.g., "2 min ago", "1 hour ago", "Yesterday")
export const formatNotificationTime = (dateString) => {
  if (!dateString) return 'Just now';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

// Get notification icon based on type
export const getNotificationIcon = (type) => {
  const icons = {
    ORDER_CONFIRMATION: '✅',
    ORDER_STATUS_UPDATE: '🔄',
    ORDER_DELIVERED: '🎉',
    ORDER_CANCELLED: '❌',
    PAYMENT_SUCCESS: '💳',
    PAYMENT_FAILED: '⚠️',
    REFUND_PROCESSED: '💰',
    WELCOME: '👋',
    PROMOTION: '🎁',
    OFFER: '🏷️',
    REMINDER: '⏰',
    SYSTEM_ALERT: '🔔',
    DELIVERY_UPDATE: '🚚',
    REVIEW_REQUEST: '⭐',
  };
  return icons[type] || '📢';
};

// Get notification color based on type
export const getNotificationColor = (type) => {
  const colors = {
    ORDER_CONFIRMATION: 'text-green-600 bg-green-50',
    ORDER_STATUS_UPDATE: 'text-blue-600 bg-blue-50',
    ORDER_DELIVERED: 'text-green-600 bg-green-50',
    ORDER_CANCELLED: 'text-red-600 bg-red-50',
    PAYMENT_SUCCESS: 'text-green-600 bg-green-50',
    PAYMENT_FAILED: 'text-red-600 bg-red-50',
    REFUND_PROCESSED: 'text-purple-600 bg-purple-50',
    WELCOME: 'text-orange-600 bg-orange-50',
    PROMOTION: 'text-pink-600 bg-pink-50',
    OFFER: 'text-yellow-600 bg-yellow-50',
    DELIVERY_UPDATE: 'text-indigo-600 bg-indigo-50',
    REVIEW_REQUEST: 'text-teal-600 bg-teal-50',
  };
  return colors[type] || 'text-gray-600 bg-gray-50';
};

// Get notification type label
export const getNotificationTypeLabel = (type) => {
  const labels = {
    ORDER_CONFIRMATION: 'Order Confirmed',
    ORDER_STATUS_UPDATE: 'Order Updated',
    ORDER_DELIVERED: 'Order Delivered',
    ORDER_CANCELLED: 'Order Cancelled',
    PAYMENT_SUCCESS: 'Payment Successful',
    PAYMENT_FAILED: 'Payment Failed',
    REFUND_PROCESSED: 'Refund Processed',
    WELCOME: 'Welcome',
    PROMOTION: 'Promotion',
    OFFER: 'Special Offer',
    DELIVERY_UPDATE: 'Delivery Update',
    REVIEW_REQUEST: 'Review Request',
  };
  return labels[type] || 'Notification';
};