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

// Get payment method icon and color
export const getPaymentMethodConfig = (method) => {
  const methods = {
    COD: { icon: '💵', label: 'Cash on Delivery', color: 'bg-green-100 text-green-700', borderColor: 'border-green-200' },
    CARD: { icon: '💳', label: 'Credit/Debit Card', color: 'bg-blue-100 text-blue-700', borderColor: 'border-blue-200' },
    UPI: { icon: '📱', label: 'UPI', color: 'bg-purple-100 text-purple-700', borderColor: 'border-purple-200' },
    WALLET: { icon: '👛', label: 'Wallet', color: 'bg-orange-100 text-orange-700', borderColor: 'border-orange-200' },
    NET_BANKING: { icon: '🏦', label: 'Net Banking', color: 'bg-indigo-100 text-indigo-700', borderColor: 'border-indigo-200' },
  };
  return methods[method] || methods.COD;
};

// Mock card validation
export const validateCardNumber = (number) => {
  const cleanNumber = number.replace(/\s/g, '');
  return /^[0-9]{16}$/.test(cleanNumber);
};

export const validateExpiry = (expiry) => {
  return /^(0[1-9]|1[0-2])\/([0-9]{2})$/.test(expiry);
};

export const validateCVV = (cvv) => {
  return /^[0-9]{3,4}$/.test(cvv);
};

// Format card number (XXXX XXXX XXXX XXXX)
export const formatCardNumber = (value) => {
  const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
  const matches = v.match(/\d{4,16}/g);
  const match = (matches && matches[0]) || '';
  const parts = [];
  for (let i = 0, len = match.length; i < len; i += 4) {
    parts.push(match.substring(i, i + 4));
  }
  if (parts.length) {
    return parts.join(' ');
  } else {
    return value;
  }
};

// Format expiry (MM/YY)
export const formatExpiry = (value) => {
  const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
  if (v.length >= 2) {
    return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
  }
  return v;
};