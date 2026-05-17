import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { addressService } from '../services/addressService';
import toast from 'react-hot-toast';

// Async Thunks
export const fetchAddresses = createAsyncThunk(
  'address/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await addressService.getAllAddresses();
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch addresses');
    }
  }
);

export const fetchDefaultAddress = createAsyncThunk(
  'address/fetchDefault',
  async (_, { rejectWithValue }) => {
    try {
      const response = await addressService.getDefaultAddress();
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const addAddress = createAsyncThunk(
  'address/add',
  async (addressData, { rejectWithValue, dispatch }) => {
    try {
      const response = await addressService.addAddress(addressData);
      toast.success('Address added successfully!');
      dispatch(fetchAddresses());
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to add address';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const updateAddress = createAsyncThunk(
  'address/update',
  async ({ id, addressData }, { rejectWithValue, dispatch }) => {
    try {
      const response = await addressService.updateAddress(id, addressData);
      toast.success('Address updated successfully!');
      dispatch(fetchAddresses());
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update address';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const setDefaultAddress = createAsyncThunk(
  'address/setDefault',
  async (id, { rejectWithValue, dispatch }) => {
    try {
      const response = await addressService.setDefaultAddress(id);
      toast.success('Default address updated!');
      dispatch(fetchAddresses());
      dispatch(fetchDefaultAddress());
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to set default address';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const deleteAddress = createAsyncThunk(
  'address/delete',
  async (id, { rejectWithValue, dispatch }) => {
    try {
      const response = await addressService.deleteAddress(id);
      toast.success('Address deleted successfully!');
      dispatch(fetchAddresses());
      dispatch(fetchDefaultAddress());
      return id;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete address';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

const initialState = {
  addresses: [],
  defaultAddress: null,
  isLoading: false,
  error: null,
};

const addressSlice = createSlice({
  name: 'address',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearAddresses: (state) => {
      state.addresses = [];
      state.defaultAddress = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Addresses
      .addCase(fetchAddresses.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAddresses.fulfilled, (state, action) => {
        state.isLoading = false;
        state.addresses = action.payload || [];
      })
      .addCase(fetchAddresses.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch Default Address
      .addCase(fetchDefaultAddress.fulfilled, (state, action) => {
        state.defaultAddress = action.payload;
      })
      .addCase(fetchDefaultAddress.rejected, (state) => {
        state.defaultAddress = null;
      })
      // Add Address
      .addCase(addAddress.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(addAddress.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(addAddress.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update Address
      .addCase(updateAddress.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateAddress.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(updateAddress.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Delete Address
      .addCase(deleteAddress.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteAddress.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(deleteAddress.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearAddresses } = addressSlice.actions;
export default addressSlice.reducer;