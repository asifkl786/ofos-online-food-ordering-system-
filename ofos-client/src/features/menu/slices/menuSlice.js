import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { menuService } from '../services/menuService';
import toast from 'react-hot-toast';

// Async Thunks
export const fetchMenuItems = createAsyncThunk(
  'menu/fetchAll',
  async ({ restaurantId, page, size }, { rejectWithValue }) => {
    try {
      const response = await menuService.getAvailableMenuItems(restaurantId, page, size);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch menu');
    }
  }
);

export const fetchMenuItemsByCategory = createAsyncThunk(
  'menu/fetchByCategory',
  async ({ restaurantId, categoryId }, { rejectWithValue }) => {
    try {
      const response = await menuService.getMenuItemsByCategory(restaurantId, categoryId);
      return { categoryId, items: response.data.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch category items');
    }
  }
);

export const searchMenuItems = createAsyncThunk(
  'menu/search',
  async ({ restaurantId, keyword, page, size }, { rejectWithValue }) => {
    try {
      const response = await menuService.searchMenuItems(restaurantId, keyword, page, size);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Search failed');
    }
  }
);

export const fetchVegetarianItems = createAsyncThunk(
  'menu/fetchVegetarian',
  async ({ restaurantId }, { rejectWithValue }) => {
    try {
      const response = await menuService.getVegetarianMenuItems(restaurantId);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch veg items');
    }
  }
);

export const fetchDiscountedItems = createAsyncThunk(
  'menu/fetchDiscounted',
  async ({ restaurantId }, { rejectWithValue }) => {
    try {
      const response = await menuService.getDiscountedMenuItems(restaurantId);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch discounted items');
    }
  }
);

const initialState = {
  items: [],
  filteredItems: [],
  categories: [],
  selectedCategory: null,
  searchKeyword: '',
  isVegFilter: false,
  isLoading: false,
  error: null,
  pagination: {
    totalElements: 0,
    totalPages: 0,
    currentPage: 0,
    pageSize: 50,
  },
};

const menuSlice = createSlice({
  name: 'menu',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearMenu: (state) => {
      state.items = [];
      state.filteredItems = [];
      state.selectedCategory = null;
      state.searchKeyword = '';
      state.isVegFilter = false;
    },
    setSelectedCategory: (state, action) => {
      state.selectedCategory = action.payload;
    },
    setSearchKeyword: (state, action) => {
      state.searchKeyword = action.payload;
    },
    setVegFilter: (state, action) => {
      state.isVegFilter = action.payload;
    },
    filterMenu: (state) => {
      let filtered = [...state.items];
      
      // Filter by category
      if (state.selectedCategory) {
        filtered = filtered.filter(item => item.categoryId === state.selectedCategory);
      }
      
      // Filter by veg/non-veg
      if (state.isVegFilter) {
        filtered = filtered.filter(item => item.isVegetarian === true);
      }
      
      // Filter by search keyword
      if (state.searchKeyword) {
        const keyword = state.searchKeyword.toLowerCase();
        filtered = filtered.filter(item => 
          item.name.toLowerCase().includes(keyword) ||
          item.description?.toLowerCase().includes(keyword)
        );
      }
      
      state.filteredItems = filtered;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Menu Items
      .addCase(fetchMenuItems.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMenuItems.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.content || [];
        state.filteredItems = action.payload.content || [];
        state.pagination = {
          totalElements: action.payload.totalElements || 0,
          totalPages: action.payload.totalPages || 0,
          currentPage: action.payload.number || 0,
          pageSize: action.payload.size || 50,
        };
      })
      .addCase(fetchMenuItems.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })
      // Search Menu Items
      .addCase(searchMenuItems.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(searchMenuItems.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.content || [];
        state.filteredItems = action.payload.content || [];
      })
      .addCase(searchMenuItems.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        toast.error(action.payload);
      });
  },
});

export const { 
  clearError, 
  clearMenu, 
  setSelectedCategory, 
  setSearchKeyword, 
  setVegFilter,
  filterMenu 
} = menuSlice.actions;

export default menuSlice.reducer;
