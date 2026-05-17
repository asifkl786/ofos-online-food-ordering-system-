import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchRestaurants, 
  fetchRestaurantById, 
  searchRestaurants,
  filterRestaurants,
  setFilters, 
  resetFilters, 
  setSort,
  clearSelectedRestaurant,
  // ✅ NEW IMPORTS
  fetchRestaurantsByOwner,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  updateRestaurantStatus
} from '../slices/restaurantSlice';

export const useRestaurant = () => {
  const dispatch = useDispatch();
  
  // ========== EXISTING STATE ==========
  const { 
    restaurants, 
    selectedRestaurant, 
    isLoading, 
    error, 
    pagination,
    filters,
    sort,
    // ✅ NEW STATE
    ownerRestaurants,
    ownerPagination
  } = useSelector((state) => state.restaurant);

  // ========== EXISTING ACTIONS ==========
  const getAllRestaurants = (page = 0, size = 10, sortBy = sort.sortBy, sortDirection = sort.sortDirection) => {
    dispatch(fetchRestaurants({ page, size, sortBy, sortDirection }));
  };

  const getRestaurantById = (id) => {
    dispatch(fetchRestaurantById(id));
  };

  const search = (keyword, page = 0, size = 10) => {
    dispatch(searchRestaurants({ keyword, page, size }));
  };

  const filter = (filterParams) => {
    dispatch(filterRestaurants(filterParams));
  };

  const updateFilters = (newFilters) => {
    dispatch(setFilters(newFilters));
  };

  const clearFilters = () => {
    dispatch(resetFilters());
  };

  const updateSort = (sortBy, sortDirection) => {
    dispatch(setSort({ sortBy, sortDirection }));
  };

  const clearSelected = () => {
    dispatch(clearSelectedRestaurant());
  };

  // ========== ✅ NEW ACTIONS FOR OWNER ==========

  // Get restaurants by owner ID
  const getRestaurantsByOwner = (ownerId, page = 0, size = 10) => {
    return dispatch(fetchRestaurantsByOwner({ ownerId, page, size }));
  };

  // Create new restaurant
  const createNewRestaurant = (restaurantData) => {
    return dispatch(createRestaurant(restaurantData));
  };

  // Update existing restaurant
  const updateExistingRestaurant = (id, restaurantData) => {
    return dispatch(updateRestaurant({ id, restaurantData }));
  };

  // Delete existing restaurant
  const deleteExistingRestaurant = (id) => {
    return dispatch(deleteRestaurant(id));
  };

  // Toggle restaurant open/close status
  const toggleRestaurantStatus = (id, isOpen) => {
    return dispatch(updateRestaurantStatus({ id, isOpen }));
  };

  return {
    // ========== EXISTING STATE ==========
    restaurants,
    selectedRestaurant,
    isLoading,
    error,
    pagination,
    filters,
    sort,
    
    // ========== EXISTING ACTIONS ==========
    getAllRestaurants,
    getRestaurantById,
    search,
    filter,
    updateFilters,
    clearFilters,
    updateSort,
    clearSelected,

    // ========== ✅ NEW STATE ==========
    ownerRestaurants,
    ownerPagination,

    // ========== ✅ NEW ACTIONS ==========
    getRestaurantsByOwner,
    createNewRestaurant,
    updateExistingRestaurant,
    deleteExistingRestaurant,
    toggleRestaurantStatus,
  };
};
