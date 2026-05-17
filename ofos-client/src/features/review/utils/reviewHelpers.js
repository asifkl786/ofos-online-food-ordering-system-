// Format date
export const formatReviewDate = (dateString) => {
  if (!dateString) return 'Recently';
  const date = new Date(dateString);
  const now = new Date();
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

// Get rating color
export const getRatingColor = (rating) => {
  if (rating >= 4.5) return 'text-green-600';
  if (rating >= 4.0) return 'text-green-600';
  if (rating >= 3.5) return 'text-yellow-600';
  if (rating >= 3.0) return 'text-orange-600';
  return 'text-red-600';
};

// Get rating text
export const getRatingText = (rating) => {
  if (rating >= 4.5) return 'Excellent';
  if (rating >= 4.0) return 'Very Good';
  if (rating >= 3.5) return 'Good';
  if (rating >= 3.0) return 'Average';
  return 'Poor';
};

// Get rating background color
export const getRatingBgColor = (rating) => {
  if (rating >= 4.5) return 'bg-green-100';
  if (rating >= 4.0) return 'bg-green-100';
  if (rating >= 3.5) return 'bg-yellow-100';
  if (rating >= 3.0) return 'bg-orange-100';
  return 'bg-red-100';
};

// Get rating distribution colors
export const getRatingDistributionColor = (rating) => {
  const colors = {
    5: 'bg-green-500',
    4: 'bg-blue-500',
    3: 'bg-yellow-500',
    2: 'bg-orange-500',
    1: 'bg-red-500',
  };
  return colors[rating] || 'bg-gray-500';
};

export const formatCurrency = (amount) => {
  const value = Number(amount || 0);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
};
