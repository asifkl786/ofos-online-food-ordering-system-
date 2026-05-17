import api from '../../../api/axiosConfig';

export const orderService = {
  // Create new order
  createOrder: (orderData) => {
    return api.post('/orders', orderData);
  },

  // Get all orders for current user
  getUserOrders: (page = 0, size = 10) => {
    return api.get('/orders/my-orders', { params: { page, size } });
  },

  // Get single order by ID
  getOrderById: (orderId) => {
    return api.get(`/orders/${orderId}`);
  },

  // Get order by order number
  getOrderByNumber: (orderNumber) => {
    return api.get(`/orders/number/${orderNumber}`);
  },

  // Cancel order
  cancelOrder: (orderId, cancellationReason) => {
    return api.post(`/orders/${orderId}/cancel`, null, {
      params: { cancellationReason }
    });
  },

  // Get active orders count
  getActiveOrdersCount: () => {
    return api.get('/orders/active-count');
  },

  // Get all orders for the logged-in restaurant owner
  getOwnerOrders: (page = 0, size = 20) => {
    return api.get('/orders/owner', { params: { page, size } });
  },

  // Update order status for restaurant owner/admin workflows
  updateOrderStatus: (orderId, status, cancellationReason = null) => {
    return api.patch(`/orders/${orderId}/status`, { status, cancellationReason }, { params: { status } });
  },

  // Get order history summary
  getOrderHistory: (page = 0, size = 10) => {
    return api.get('/orders/history', { params: { page, size } });
  },
};
