import api from '../../../api/axiosConfig';

export const menuService = {
  // Get all menu items for a restaurant
  getMenuItemsByRestaurant: (restaurantId, page = 0, size = 50) => {
    return api.get(`/menu/restaurant/${restaurantId}`, {
      params: { page, size }
    });
  },
  
  // Get available menu items only
  getAvailableMenuItems: (restaurantId, page = 0, size = 50) => {
    return api.get(`/menu/restaurant/${restaurantId}/available`, {
      params: { page, size }
    });
  },
  
  // Get menu items by category
  getMenuItemsByCategory: (restaurantId, categoryId) => {
    return api.get(`/menu/restaurant/${restaurantId}/category/${categoryId}`);
  },
  
  // Search menu items
  searchMenuItems: (restaurantId, keyword, page = 0, size = 50) => {
    return api.get(`/menu/restaurant/${restaurantId}/search`, {
      params: { keyword, page, size }
    });
  },
  
  // Get vegetarian menu items
  getVegetarianMenuItems: (restaurantId) => {
    return api.get(`/menu/restaurant/${restaurantId}/vegetarian`);
  },
  
  // Get discounted menu items
  getDiscountedMenuItems: (restaurantId) => {
    return api.get(`/menu/restaurant/${restaurantId}/discounted`);
  },
  
  // Get menu items by price range
  getMenuItemsByPriceRange: (restaurantId, minPrice, maxPrice) => {
    return api.get(`/menu/restaurant/${restaurantId}/price-range`, {
      params: { minPrice, maxPrice }
    });
  },

  // Get active categories for owner/admin menu forms
  getActiveCategories: () => {
    return api.get('/categories/active');
  },

  // Restaurant owners can quickly create missing menu categories from the owner menu form
  createCategory: (category) => {
    return api.post('/categories', category);
  },

  // Create menu item for a restaurant owner/admin
  createMenuItem: (restaurantId, menuItem) => {
    return api.post(`/menu/restaurant/${restaurantId}`, menuItem);
  },

  // Update full menu item details
  updateMenuItem: (menuItemId, menuItem) => {
    return api.put(`/menu/${menuItemId}`, menuItem);
  },

  // Toggle menu item customer visibility
  updateMenuItemAvailability: (menuItemId, isAvailable) => {
    return api.patch(`/menu/${menuItemId}/availability`, null, { params: { isAvailable } });
  },

  // Delete menu item from owner/admin menu control
  deleteMenuItem: (menuItemId) => {
    return api.delete(`/menu/${menuItemId}`);
  },
  
  // Get single menu item
  getMenuItemById: (menuItemId) => {
    return api.get(`/menu/${menuItemId}`);
  },
};
