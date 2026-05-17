import api from '../../../api/axiosConfig';

export const addressService = {
  // Get all addresses for current user
  getAllAddresses: () => {
    return api.get('/addresses');
  },

  // Get active addresses only
  getActiveAddresses: () => {
    return api.get('/addresses/active');
  },

  // Get default address
  getDefaultAddress: () => {
    return api.get('/addresses/default');
  },

  // Get address by ID
  getAddressById: (id) => {
    return api.get(`/addresses/${id}`);
  },

  // Add new address
  addAddress: (addressData) => {
    return api.post('/addresses', addressData);
  },

  // Update address
  updateAddress: (id, addressData) => {
    return api.put(`/addresses/${id}`, addressData);
  },

  // Set address as default
  setDefaultAddress: (id) => {
    return api.patch(`/addresses/${id}/default`);
  },

  // Delete address (soft delete)
  deleteAddress: (id) => {
    return api.delete(`/addresses/${id}`);
  },

  // Hard delete address
  hardDeleteAddress: (id) => {
    return api.delete(`/addresses/${id}/hard`);
  },

  // Get addresses by type
  getAddressesByType: (type) => {
    return api.get(`/addresses/type/${type}`);
  },
};