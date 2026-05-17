import api from '../../../api/axiosConfig';

const emptyToNull = (value) => {
  if (value === '' || value === undefined || value === null) return null;
  if (typeof value === 'string') {
    const trimmedValue = value.trim();
    return trimmedValue === '' ? null : trimmedValue;
  }
  return value;
};

const digitsOnly = (value) => (typeof value === 'string' ? value.replace(/\D/g, '') : value);

const normalizeTime = (value) => {
  if (!value) return null;
  return value.length === 5 ? `${value}:00` : value;
};

const normalizeRestaurantPayload = (restaurantData) => ({
  name: emptyToNull(restaurantData.name),
  description: emptyToNull(restaurantData.description),
  cuisineType: emptyToNull(restaurantData.cuisineType),
  minimumOrderAmount: emptyToNull(restaurantData.minimumOrderAmount),
  deliveryFee: emptyToNull(restaurantData.deliveryFee),
  openingTime: normalizeTime(restaurantData.openingTime),
  closingTime: normalizeTime(restaurantData.closingTime),
  contactPhone: emptyToNull(digitsOnly(restaurantData.contactPhone)),
  contactEmail: emptyToNull(restaurantData.contactEmail),
  website: emptyToNull(restaurantData.website),
  gstNumber: emptyToNull(restaurantData.gstNumber),
  fssaiLicenseNumber: emptyToNull(restaurantData.fssaiLicenseNumber),
  address: restaurantData.address ? {
    streetAddress: emptyToNull(restaurantData.address.streetAddress),
    landmark: emptyToNull(restaurantData.address.landmark),
    city: emptyToNull(restaurantData.address.city),
    state: emptyToNull(restaurantData.address.state),
    zipCode: emptyToNull(digitsOnly(restaurantData.address.zipCode)),
    country: emptyToNull(restaurantData.address.country),
    latitude: emptyToNull(restaurantData.address.latitude),
    longitude: emptyToNull(restaurantData.address.longitude),
  } : null,
});

export const restaurantService = {
  // Get all restaurants with pagination
  getAllRestaurants: (page = 0, size = 10, sortBy = 'averageRating', sortDirection = 'DESC') => {
    return api.get('/restaurants', {
      params: { page, size, sortBy, sortDirection }
    });
  },
  
  // Get single restaurant by ID
  getRestaurantById: (id) => {
    return api.get(`/restaurants/${id}`);
  },
  
  // Search restaurants by keyword
  searchRestaurants: (keyword, page = 0, size = 10) => {
    return api.get('/restaurants/search', {
      params: { keyword, page, size }
    });
  },
  
  // Filter restaurants with multiple criteria
  filterRestaurants: (filterParams) => {
    return api.post('/restaurants/filter', filterParams);
  },
  
  // Get top rated restaurants
  getTopRatedRestaurants: (page = 0, size = 10) => {
    return api.get('/restaurants/top-rated', {
      params: { page, size }
    });
  },
  
  // Get restaurants by city
  getRestaurantsByCity: (city, page = 0, size = 10) => {
    return api.get('/restaurants/filter', {
      params: { city, page, size }
    });
  },

  //====================Restaurant owner  method Start ===================================================

    // Add these new methods to existing service
    // Get restaurants by owner ID
    getRestaurantsByOwner: (_ownerId, page = 0, size = 10) => {
      return api.get('/restaurants/my', {
        params: { page, size }
      });
    },

    // Create restaurant
    createRestaurant: (restaurantData) => {
      return api.post('/restaurants', normalizeRestaurantPayload(restaurantData));
    },

    // Update restaurant
    updateRestaurant: (id, restaurantData) => {
      return api.put(`/restaurants/${id}`, normalizeRestaurantPayload(restaurantData));
    },

    // Delete restaurant
    deleteRestaurant: (id) => {
      return api.delete(`/restaurants/${id}`);
    },

    // Update restaurant open/close status
    updateRestaurantStatus: (id, isOpen) => {
      return api.patch(`/restaurants/${id}/status?isOpen=${isOpen}`);
    },

};
