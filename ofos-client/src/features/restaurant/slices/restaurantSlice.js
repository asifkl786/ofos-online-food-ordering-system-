import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { restaurantService } from '../services/restaurantService';
import toast from 'react-hot-toast';

// ========== EXISTING ASYNC THUNKS (Already there) ==========
export const fetchRestaurants = createAsyncThunk(
  'restaurant/fetchAll',
  async ({ page, size, sortBy, sortDirection }, { rejectWithValue }) => {
    try {
      const response = await restaurantService.getAllRestaurants(page, size, sortBy, sortDirection);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch restaurants');
    }
  }
);

export const fetchRestaurantById = createAsyncThunk(
  'restaurant/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await restaurantService.getRestaurantById(id);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Restaurant not found');
    }
  }
);

export const searchRestaurants = createAsyncThunk(
  'restaurant/search',
  async ({ keyword, page, size }, { rejectWithValue }) => {
    try {
      const response = await restaurantService.searchRestaurants(keyword, page, size);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Search failed');
    }
  }
);

export const filterRestaurants = createAsyncThunk(
  'restaurant/filter',
  async (filterParams, { rejectWithValue }) => {
    try {
      const response = await restaurantService.filterRestaurants(filterParams);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Filter failed');
    }
  }
);

// ========== ✅ NEW ASYNC THUNKS FOR OWNER  ==========

// Fetch restaurants by owner ID
export const fetchRestaurantsByOwner = createAsyncThunk(
  'restaurant/fetchByOwner',
  async ({ ownerId, page, size }, { rejectWithValue }) => {
    try {
      const response = await restaurantService.getRestaurantsByOwner(ownerId, page, size);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

// Create new restaurant
export const createRestaurant = createAsyncThunk(
  'restaurant/create',
  async (restaurantData, { rejectWithValue }) => {
    try {
      const response = await restaurantService.createRestaurant(restaurantData);
      toast.success('Restaurant created successfully!');
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create restaurant';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// Update restaurant
export const updateRestaurant = createAsyncThunk(
  'restaurant/update',
  async ({ id, restaurantData }, { rejectWithValue }) => {
    try {
      const response = await restaurantService.updateRestaurant(id, restaurantData);
      toast.success('Restaurant updated successfully!');
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update restaurant';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// Delete restaurant
export const deleteRestaurant = createAsyncThunk(
  'restaurant/delete',
  async (id, { rejectWithValue }) => {
    try {
      await restaurantService.deleteRestaurant(id);
      toast.success('Restaurant deleted successfully!');
      return id;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete restaurant';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// Update restaurant open/close status
export const updateRestaurantStatus = createAsyncThunk(
  'restaurant/updateStatus',
  async ({ id, isOpen }, { rejectWithValue }) => {
    try {
      const response = await restaurantService.updateRestaurantStatus(id, isOpen);
      toast.success(`Restaurant ${isOpen ? 'opened' : 'closed'}`);
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update status';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// ========== INITIAL STATE (Updated with ownerRestaurants) ==========
const initialState = {
  // ✅ NEW: For restaurant owner
  ownerRestaurants: [],
  ownerPagination: {
    totalElements: 0,
    totalPages: 0,
    currentPage: 0,
    pageSize: 10,
  },
  // Existing: For customer
  restaurants: [],
  selectedRestaurant: null,
  isLoading: false,
  error: null,
  pagination: {
    totalElements: 0,
    totalPages: 0,
    currentPage: 0,
    pageSize: 10,
  },
  filters: {
    keyword: '',
    cuisineType: null,
    city: null,
    minRating: null,
    isOpen: null,
  },
  sort: {
    sortBy: 'averageRating',
    sortDirection: 'DESC',
  },
};

const restaurantSlice = createSlice({
  name: 'restaurant',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedRestaurant: (state) => {
      state.selectedRestaurant = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
    setSort: (state, action) => {
      state.sort = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // ========== EXISTING CASES (Already there) ==========
      // Fetch All Restaurants
      .addCase(fetchRestaurants.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRestaurants.fulfilled, (state, action) => {
        state.isLoading = false;
        const nextContent = action.payload.content || [];
        state.restaurants = action.meta.arg?.page > 0 ? [...state.restaurants, ...nextContent] : nextContent;
        state.pagination = {
          totalElements: action.payload.totalElements || 0,
          totalPages: action.payload.totalPages || 0,
          currentPage: action.payload.number || 0,
          pageSize: action.payload.size || 10,
        };
      })
      .addCase(fetchRestaurants.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })
      // Fetch Single Restaurant
      .addCase(fetchRestaurantById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRestaurantById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedRestaurant = action.payload;
      })
      .addCase(fetchRestaurantById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })
      // Search Restaurants
      .addCase(searchRestaurants.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchRestaurants.fulfilled, (state, action) => {
        state.isLoading = false;
        const nextContent = action.payload.content || [];
        state.restaurants = action.meta.arg?.page > 0 ? [...state.restaurants, ...nextContent] : nextContent;
        state.pagination = {
          totalElements: action.payload.totalElements || 0,
          totalPages: action.payload.totalPages || 0,
          currentPage: action.payload.number || 0,
          pageSize: action.payload.size || 10,
        };
      })
      .addCase(searchRestaurants.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })
      // Filter Restaurants
      .addCase(filterRestaurants.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(filterRestaurants.fulfilled, (state, action) => {
        state.isLoading = false;
        const nextContent = action.payload.content || [];
        state.restaurants = action.meta.arg?.page > 0 ? [...state.restaurants, ...nextContent] : nextContent;
        state.pagination = {
          totalElements: action.payload.totalElements || 0,
          totalPages: action.payload.totalPages || 0,
          currentPage: action.payload.number || 0,
          pageSize: action.payload.size || 10,
        };
      })
      .addCase(filterRestaurants.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })

      // ========== ✅ NEW CASES FOR OWNER ==========
      // Fetch Restaurants By Owner
      .addCase(fetchRestaurantsByOwner.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRestaurantsByOwner.fulfilled, (state, action) => {
        state.isLoading = false;
        state.ownerRestaurants = action.payload.content || [];
        state.ownerPagination = {
          totalElements: action.payload.totalElements || 0,
          totalPages: action.payload.totalPages || 0,
          currentPage: action.payload.number || 0,
          pageSize: action.payload.size || 10,
        };
      })
      .addCase(fetchRestaurantsByOwner.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })
      // Create Restaurant
      .addCase(createRestaurant.fulfilled, (state, action) => {
        // Optionally add to ownerRestaurants (will be fetched again)
      })
      // Update Restaurant
      .addCase(updateRestaurant.fulfilled, (state, action) => {
        // Optionally update in ownerRestaurants
      })
      // Delete Restaurant
      .addCase(deleteRestaurant.fulfilled, (state, action) => {
        state.ownerRestaurants = state.ownerRestaurants.filter(r => r.id !== action.payload);
      });
  },
});

export const { clearError, clearSelectedRestaurant, setFilters, resetFilters, setSort } = restaurantSlice.actions;
export default restaurantSlice.reducer;
