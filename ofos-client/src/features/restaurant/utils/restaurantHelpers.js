// Helper functions for restaurant module

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

// Format time (e.g., "09:00:00" → "9:00 AM")
export const formatTime = (timeString) => {
  if (!timeString) return 'Not specified';
  const [hours, minutes] = timeString.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const formattedHour = hour % 12 || 12;
  return `${formattedHour}:${minutes} ${ampm}`;
};

// Get delivery time estimate (minutes)
export const getDeliveryEstimate = () => {
  const times = [20, 25, 30, 35, 40];
  return times[Math.floor(Math.random() * times.length)];
};

// Get rating color based on value
export const getRatingColor = (rating) => {
  if (rating >= 4.5) return 'text-green-600 bg-green-100';
  if (rating >= 4.0) return 'text-green-600 bg-green-100';
  if (rating >= 3.5) return 'text-yellow-600 bg-yellow-100';
  if (rating >= 3.0) return 'text-orange-600 bg-orange-100';
  return 'text-red-600 bg-red-100';
};

// Get rating text
export const getRatingText = (rating) => {
  if (rating >= 4.5) return 'Excellent';
  if (rating >= 4.0) return 'Very Good';
  if (rating >= 3.5) return 'Good';
  if (rating >= 3.0) return 'Average';
  return 'Poor';
};

// Get cuisine icon
export const getCuisineIcon = (cuisineType) => {
  const cuisine = cuisineType?.toLowerCase() || '';
  if (cuisine.includes('north indian')) return '🍛';
  if (cuisine.includes('south indian')) return '🥞';
  if (cuisine.includes('chinese')) return '🥡';
  if (cuisine.includes('italian')) return '🍕';
  if (cuisine.includes('fast food')) return '🍔';
  if (cuisine.includes('street food')) return '🌯';
  if (cuisine.includes('biryani')) return '🍚';
  if (cuisine.includes('dessert')) return '🍰';
  return '🍽️';
};

// Truncate text
export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};