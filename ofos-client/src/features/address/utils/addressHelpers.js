// Format full address as string
export const formatFullAddress = (address) => {
  const parts = [];
  if (address.streetAddress) parts.push(address.streetAddress);
  if (address.apartmentNumber) parts.push(address.apartmentNumber);
  if (address.landmark) parts.push(`(${address.landmark})`);
  if (address.city) parts.push(address.city);
  if (address.state) parts.push(address.state);
  if (address.zipCode) parts.push(address.zipCode);
  if (address.country) parts.push(address.country);
  return parts.join(', ');
};

// Get address type icon and color
export const getAddressTypeConfig = (type) => {
  const types = {
    HOME: { icon: '🏠', label: 'Home', color: 'bg-blue-100 text-blue-700', borderColor: 'border-blue-200' },
    WORK: { icon: '💼', label: 'Work', color: 'bg-purple-100 text-purple-700', borderColor: 'border-purple-200' },
    OTHER: { icon: '📍', label: 'Other', color: 'bg-gray-100 text-gray-700', borderColor: 'border-gray-200' },
  };
  return types[type] || types.OTHER;
};

// Validate pincode format
export const isValidPincode = (pincode) => {
  return /^[1-9][0-9]{5}$/.test(pincode);
};

// Validate phone number
export const isValidPhone = (phone) => {
  return /^[6-9][0-9]{9}$/.test(phone);
};

// Truncate address for display
export const truncateAddress = (address, maxLength = 80) => {
  if (address.length <= maxLength) return address;
  return address.substring(0, maxLength) + '...';
};