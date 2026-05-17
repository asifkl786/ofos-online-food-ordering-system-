import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { paymentService } from '../services/paymentService';
import toast from 'react-hot-toast';

// Async Thunks
export const initiatePayment = createAsyncThunk(
  'payment/initiate',
  async ({ orderId, paymentMethod }, { rejectWithValue }) => {
    try {
      const response = await paymentService.initiatePayment(orderId, paymentMethod);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const processMockPayment = createAsyncThunk(
  'payment/processMockPayment',
  async ({ orderId, paymentDetails }, { rejectWithValue }) => {
    try {
      const result = await paymentService.processMockPayment(orderId, paymentDetails);
      if (result.success) {
        toast.success(result.message);
        return result;
      } else {
        toast.error(result.error);
        return rejectWithValue(result.error);
      }
    } catch (error) {
      toast.error('Payment processing failed');
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  currentPayment: null,
  paymentStatus: null,
  isLoading: false,
  error: null,
};

const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    clearPayment: (state) => {
      state.currentPayment = null;
      state.paymentStatus = null;
      state.error = null;
    },
    setPaymentStatus: (state, action) => {
      state.paymentStatus = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Initiate Payment
      .addCase(initiatePayment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(initiatePayment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentPayment = action.payload;
      })
      .addCase(initiatePayment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Process Mock Payment
      .addCase(processMockPayment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(processMockPayment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentPayment = action.payload;
        state.paymentStatus = 'SUCCESS';
      })
      .addCase(processMockPayment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.paymentStatus = 'FAILED';
      });
  },
});

export const { clearPayment, setPaymentStatus } = paymentSlice.actions;
export default paymentSlice.reducer;