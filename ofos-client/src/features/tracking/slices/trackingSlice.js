import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { trackingService } from '../services/trackingService';
import toast from 'react-hot-toast';

export const fetchTrackingDetails = createAsyncThunk(
  'tracking/fetchDetails',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await trackingService.getTrackingDetails(orderId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch tracking details');
    }
  }
);

const initialState = {
  order: null,
  status: null,
  isLoading: false,
  error: null,
  progress: 0,
};

const trackingSlice = createSlice({
  name: 'tracking',
  initialState,
  reducers: {
    clearTracking: (state) => {
      state.order = null;
      state.status = null;
      state.error = null;
    },
    updateStatus: (state, action) => {
      if (state.order) {
        state.order.status = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTrackingDetails.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTrackingDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.order = action.payload;
        state.status = action.payload?.status;
      })
      .addCase(fetchTrackingDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        toast.error(action.payload);
      });
  },
});

export const { clearTracking, updateStatus } = trackingSlice.actions;
export default trackingSlice.reducer;