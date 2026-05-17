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
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Get status badge config
export const getDeliveryStatusConfig = (status) => {
  const statuses = {
    PENDING: { label: 'Pending Assignment', color: 'bg-yellow-100 text-yellow-700', icon: '⏳' },
    ACCEPTED: { label: 'Accepted', color: 'bg-blue-100 text-blue-700', icon: '✓' },
    PICKED_UP: { label: 'Picked Up', color: 'bg-purple-100 text-purple-700', icon: '📦' },
    DELIVERED: { label: 'Delivered', color: 'bg-green-100 text-green-700', icon: '✅' },
    CANCELLED: { label: 'Cancelled', color: 'bg-red-100 text-red-700', icon: '❌' },
  };
  return statuses[status] || statuses.PENDING;
};

// Calculate delivery fee (mock)
export const calculateDeliveryFee = (distance, baseFee = 40, perKmRate = 5) => {
  return baseFee + (distance * perKmRate);
};

// Get vehicle icon
export const getVehicleIcon = (vehicleType) => {
  const vehicles = {
    BIKE: '🏍️',
    SCOOTER: '🛵',
    CAR: '🚗',
    CYCLE: '🚲',
  };
  return vehicles[vehicleType] || '🚚';
};

// Mock delivery partners
export const getMockDeliveryPartners = () => {
  return [
    { id: 1, name: 'Rajesh Kumar', phone: '+91 98765 43210', rating: 4.8, deliveries: 245, vehicle: 'BIKE', available: true, earnings: 12500 },
    { id: 2, name: 'Amit Singh', phone: '+91 98765 43211', rating: 4.9, deliveries: 312, vehicle: 'SCOOTER', available: true, earnings: 15800 },
    { id: 3, name: 'Vikram Sharma', phone: '+91 98765 43212', rating: 4.7, deliveries: 189, vehicle: 'CAR', available: false, earnings: 9800 },
    { id: 4, name: 'Sunil Kumar', phone: '+91 98765 43213', rating: 4.6, deliveries: 156, vehicle: 'BIKE', available: true, earnings: 7800 },
  ];
};