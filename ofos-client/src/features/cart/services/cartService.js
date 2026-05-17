import api from '../../../api/axiosConfig';

export const cartService = {
  // Get cart items
  getCart: () => {
    return api.get('/cart');
  },

  // Add item to cart
  addToCart: (menuItemId, quantity, specialInstructions = '') => {
    return api.post('/cart/add', {
      menuItemId,
      quantity,
      specialInstructions
    });
  },

  // Update cart item quantity
  updateCartItem: (cartItemId, quantity) => {
    return api.put('/cart/update', {
      cartItemId,
      quantity
    });
  },

  // Remove item from cart
  removeFromCart: (cartItemId) => {
    return api.delete(`/cart/remove/${cartItemId}`);
  },

  // Clear entire cart
  clearCart: () => {
    return api.delete('/cart/clear');
  },

  // Get cart item count
  getCartCount: () => {
    return api.get('/cart/count');
  },

  // Validate cart before checkout
  validateCart: () => {
    return api.post('/cart/validate');
  }
};