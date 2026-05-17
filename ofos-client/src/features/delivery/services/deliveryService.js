import api from '../../../api/axiosConfig';
import { getMockDeliveryPartners } from '../utils/deliveryHelpers';

export const deliveryService = {
  // Register as delivery partner
  registerPartner: (partnerData) => {
    return api.post('/delivery/register', partnerData);
  },

  // Get delivery partner profile
  getPartnerProfile: () => {
    return api.get('/delivery/profile');
  },

  // Update partner availability
  updateAvailability: (isAvailable) => {
    return api.patch('/delivery/status', { status: isAvailable ? 'ONLINE' : 'OFFLINE' });
  },

  // Update current location
  updateLocation: (latitude, longitude) => {
    return api.post('/delivery/location', { latitude, longitude });
  },

  // Get available partners for an order
  getAvailablePartners: () => {
    return api.get('/delivery/available', { params: { includeUnavailable: true } });
  },

  // Assign partner to order (Restaurant Owner)
  assignPartner: (orderId, partnerId) => {
    return api.post('/delivery/assign', { orderId, deliveryPartnerId: partnerId });
  },

  // Update assignment status (Delivery Partner)
  updateAssignmentStatus: (assignmentId, status, reason = null) => {
    return api.put('/delivery/assignment/status', { assignmentId, status, rejectionReason: reason });
  },

  // Get assignments for a partner
  getPartnerAssignments: () => {
    return api.get('/delivery/assignments/my');
  },

  // Get orders pending delivery (Restaurant Owner)
  getOrdersPendingDelivery: (restaurantId) => {
    return api.get(`/delivery/orders-pending/${restaurantId}`);
  },

  // Get delivery earnings
  getEarnings: () => {
    return api.get('/delivery/earnings');
  },

  // MOCK DATA for development
  getMockAvailablePartners: () => {
    return getMockDeliveryPartners().filter(p => p.available);
  },
};
