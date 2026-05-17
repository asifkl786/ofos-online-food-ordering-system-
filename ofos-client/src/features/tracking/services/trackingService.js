import api from '../../../api/axiosConfig';

// Mock data for development
const mockTrackingData = {
  1: {
    orderId: 1,
    orderNumber: 'ORD20260429000001',
    status: 'OUT_FOR_DELIVERY',
    createdAt: '2026-04-29T10:30:00',
    estimatedDelivery: '2026-04-29T11:15:00',
    items: [
      { name: 'Paneer Tikka', quantity: 2, price: 538 },
      { name: 'Veg Biryani', quantity: 1, price: 249 },
    ],
    deliveryAddress: {
      streetAddress: 'MG Road',
      city: 'Mumbai',
      state: 'Maharashtra',
      zipCode: '400001',
    },
    paymentMethod: 'COD',
    totalAmount: 866.35,
  },
  2: {
    orderId: 2,
    orderNumber: 'ORD20260429000002',
    status: 'PREPARING',
    createdAt: '2026-04-29T11:00:00',
    estimatedDelivery: '2026-04-29T11:45:00',
    items: [
      { name: 'Margherita Pizza', quantity: 1, price: 299 },
      { name: 'Garlic Bread', quantity: 2, price: 198 },
    ],
    deliveryAddress: {
      streetAddress: 'BKC, Bandra East',
      city: 'Mumbai',
      state: 'Maharashtra',
      zipCode: '400051',
    },
    paymentMethod: 'CARD',
    totalAmount: 497,
  },
};

export const trackingService = {
  
  //=====================getTracking Details===============================
    getTrackingDetails: async (orderId) => {
    try {
      // Try to get from tracking API first
      const trackingResponse = await api.get(`/tracking/order/${orderId}`);
      const trackingData = trackingResponse.data.data;
      
      // Also get order details for missing fields
      try {
        const orderResponse = await api.get(`/orders/${orderId}`);
        const orderData = orderResponse.data.data;
        
        // Merge data - order details take precedence
        return {
          ...trackingData,
          totalAmount: trackingData.totalAmount || orderData.totalAmount,
          paymentMethod: trackingData.paymentMethod || orderData.paymentMethod,
          createdAt: trackingData.createdAt || orderData.createdAt,
          items: trackingData.items || orderData.items,
          deliveryAddress: trackingData.deliveryAddress || orderData.deliveryAddress,
        };
      } catch {
        return trackingData;
      }
    } catch (error) {
      console.log('Using mock tracking data for order:', orderId);
      return mockTrackingData[orderId] || mockTrackingData[1];
    }
  },

  // Mock: Simulate status update (for demo purposes)
  simulateStatusUpdate: (currentStatus) => {
    const statusFlow = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP', 'OUT_FOR_DELIVERY', 'DELIVERED'];
    const currentIndex = statusFlow.indexOf(currentStatus);
    if (currentIndex < statusFlow.length - 1) {
      return statusFlow[currentIndex + 1];
    }
    return currentStatus;
  },
};