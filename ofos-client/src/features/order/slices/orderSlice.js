import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { orderService } from '../services/orderService';
import toast from 'react-hot-toast';
import { clearCart } from '../../cart/slices/cartSlice'; // ✅ Import clearCart action

// Async Thunks
export const createOrder = createAsyncThunk(
  'order/create',
  async (orderData, { rejectWithValue, dispatch }) => {
    try {
      const response = await orderService.createOrder(orderData);
       // ✅ Clear cart after successful order
      dispatch(clearCart());  // This will clear cart state       
      toast.success('Order placed successfully!');
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to place order';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const fetchUserOrders = createAsyncThunk(
  'order/fetchUserOrders',
  async ({ page, size }, { rejectWithValue }) => {
    try {
      const response = await orderService.getUserOrders(page, size);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const fetchOrderById = createAsyncThunk(
  'order/fetchById',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await orderService.getOrderById(orderId);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const cancelOrder = createAsyncThunk(
  'order/cancel',
  async ({ orderId, reason }, { rejectWithValue, dispatch }) => {
    try {
      const response = await orderService.cancelOrder(orderId, reason);
      toast.success('Order cancelled successfully');
      dispatch(fetchUserOrders({ page: 0, size: 10 }));
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to cancel order';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const fetchActiveOrdersCount = createAsyncThunk(
  'order/fetchActiveCount',
  async (_, { rejectWithValue }) => {
    try {
      const response = await orderService.getActiveOrdersCount();
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

const initialState = {
  orders: [],
  currentOrder: null,
  activeOrdersCount: 0,
  isLoading: false,
  error: null,
  pagination: {
    totalElements: 0,
    totalPages: 0,
    currentPage: 0,
    pageSize: 10,
  },
};

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },
    clearOrders: (state) => {
      state.orders = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Order
      .addCase(createOrder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentOrder = action.payload;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch User Orders
      .addCase(fetchUserOrders.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchUserOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload.content || [];
        state.pagination = {
          totalElements: action.payload.totalElements || 0,
          totalPages: action.payload.totalPages || 0,
          currentPage: action.payload.number || 0,
          pageSize: action.payload.size || 10,
        };
      })
      .addCase(fetchUserOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch Order By ID
      .addCase(fetchOrderById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentOrder = action.payload;
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Cancel Order
      .addCase(cancelOrder.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(cancelOrder.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(cancelOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch Active Orders Count
      .addCase(fetchActiveOrdersCount.fulfilled, (state, action) => {
        state.activeOrdersCount = action.payload;
      });
  },
});

export const { clearError, clearCurrentOrder, clearOrders } = orderSlice.actions;
export default orderSlice.reducer;