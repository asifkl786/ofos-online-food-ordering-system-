import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { cartService } from '../services/cartService';
import toast from 'react-hot-toast';

// Async Thunks
export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await cartService.getCart();
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch cart');
    }
  }
);

export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async ({ menuItemId, quantity, specialInstructions }, { rejectWithValue, dispatch }) => {
    try {
      const response = await cartService.addToCart(menuItemId, quantity, specialInstructions);
      toast.success('Item added to cart!');
      dispatch(fetchCart()); // Refresh cart after add
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to add item';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const updateCartItem = createAsyncThunk(
  'cart/updateCartItem',
  async ({ cartItemId, quantity }, { rejectWithValue, dispatch }) => {
    try {
      const response = await cartService.updateCartItem(cartItemId, quantity);
      dispatch(fetchCart()); // Refresh cart after update
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update item';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async (cartItemId, { rejectWithValue, dispatch }) => {
    try {
      const response = await cartService.removeFromCart(cartItemId);
      toast.success('Item removed from cart');
      dispatch(fetchCart()); // Refresh cart after remove
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to remove item';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const clearCart = createAsyncThunk(
  'cart/clearCart',
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const response = await cartService.clearCart();
      toast.success('Cart cleared');
      dispatch(fetchCart());
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to clear cart';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const getCartCount = createAsyncThunk(
  'cart/getCartCount',
  async (_, { rejectWithValue }) => {
    try {
      const response = await cartService.getCartCount();
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

const initialState = {
  items: [],
  restaurantId: null,
  restaurantName: null,
  totalItems: 0,
  totalAmount: 0,
  deliveryFee: 0,
  tax: 0,
  grandTotal: 0,
  isEmpty: true,
  isLoading: false,
  error: null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetCart: (state) => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Cart
      .addCase(fetchCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload?.items || [];
        state.restaurantId = action.payload?.restaurantId || null;
        state.restaurantName = action.payload?.restaurantName || null;
        state.totalItems = action.payload?.totalItems || 0;
        state.totalAmount = action.payload?.totalAmount || 0;
        state.deliveryFee = action.payload?.deliveryFee || 0;
        state.tax = action.payload?.tax || 0;
        state.grandTotal = action.payload?.grandTotal || 0;
        state.isEmpty = action.payload?.isEmpty !== false;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Add to Cart
      .addCase(addToCart.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(addToCart.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update Cart Item
      .addCase(updateCartItem.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateCartItem.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(updateCartItem.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Remove from Cart
      .addCase(removeFromCart.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(removeFromCart.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Clear Cart
      .addCase(clearCart.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(clearCart.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(clearCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, resetCart } = cartSlice.actions;
export default cartSlice.reducer;