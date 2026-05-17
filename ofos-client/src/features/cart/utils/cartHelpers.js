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

// Calculate item subtotal
export const calculateItemSubtotal = (price, quantity) => {
  return price * quantity;
};

// Calculate cart totals
export const calculateCartTotals = (items, deliveryFee = 40, taxRate = 0.05) => {
  const subtotal = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  const tax = subtotal * taxRate;
  const total = subtotal + tax + deliveryFee;
  
  return {
    subtotal,
    tax,
    deliveryFee,
    total,
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0)
  };
};

// Get cart count from localStorage (for header)
export const getCartCountFromStorage = () => {
  const cart = localStorage.getItem('cart');
  if (!cart) return 0;
  try {
    const items = JSON.parse(cart);
    return items.reduce((sum, item) => sum + item.quantity, 0);
  } catch {
    return 0;
  }
};