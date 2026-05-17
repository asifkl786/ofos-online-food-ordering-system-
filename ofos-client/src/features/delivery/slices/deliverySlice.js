import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { deliveryService } from '../services/deliveryService';
import toast from 'react-hot-toast';

// Async Thunks
export const getPartnerProfile = createAsyncThunk(
  'delivery/getProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await deliveryService.getPartnerProfile();
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const registerPartner = createAsyncThunk(
  'delivery/register',
  async (partnerData, { rejectWithValue }) => {
    try {
      const response = await deliveryService.registerPartner(partnerData);
      toast.success('Registered as delivery partner successfully!');
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const updateAvailability = createAsyncThunk(
  'delivery/updateAvailability',
  async (isAvailable, { rejectWithValue }) => {
    try {
      const response = await deliveryService.updateAvailability(isAvailable);
      toast.success(isAvailable ? 'You are now online' : 'You are now offline');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const getAvailablePartners = createAsyncThunk(
  'delivery/getAvailablePartners',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await deliveryService.getAvailablePartners(orderId);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Available delivery partners load nahi ho pa rahe');
    }
  }
);

export const assignPartner = createAsyncThunk(
  'delivery/assign',
  async ({ orderId, partnerId }, { rejectWithValue }) => {
    try {
      const response = await deliveryService.assignPartner(orderId, partnerId);
      toast.success('Delivery partner assigned successfully!');
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Assignment failed';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const updateAssignmentStatus = createAsyncThunk(
  'delivery/updateStatus',
  async ({ assignmentId, status, reason }, { rejectWithValue }) => {
    try {
      const response = await deliveryService.updateAssignmentStatus(assignmentId, status, reason);
      toast.success(`Order ${status.toLowerCase().replace('_', ' ')}`);
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Status update failed';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const getPartnerAssignments = createAsyncThunk(
  'delivery/getAssignments',
  async (_, { rejectWithValue }) => {
    try {
      const response = await deliveryService.getPartnerAssignments();
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const getEarnings = createAsyncThunk(
  'delivery/getEarnings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await deliveryService.getEarnings();
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

const initialState = {
  profile: null,
  assignments: [],
  availablePartners: [],
  earnings: null,
  isLoading: false,
  error: null,
};

const deliverySlice = createSlice({
  name: 'delivery',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearDelivery: (state) => {
      state.profile = null;
      state.assignments = [];
      state.earnings = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Register Partner
      .addCase(registerPartner.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerPartner.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload;
      })
      .addCase(registerPartner.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Get Profile
      .addCase(getPartnerProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getPartnerProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload;
      })
      .addCase(getPartnerProfile.rejected, (state) => {
        state.isLoading = false;
      })
      // Get Available Partners
      .addCase(getAvailablePartners.fulfilled, (state, action) => {
        state.availablePartners = action.payload;
      })
      // Get Assignments
      .addCase(getPartnerAssignments.fulfilled, (state, action) => {
        state.assignments = action.payload;
      })
      // Get Earnings
      .addCase(getEarnings.fulfilled, (state, action) => {
        state.earnings = action.payload;
      })
      // Update Availability
      .addCase(updateAvailability.fulfilled, (state, action) => {
        state.profile = action.payload || state.profile;
      });
  },
});

export const { clearError, clearDelivery } = deliverySlice.actions;
export default deliverySlice.reducer;
