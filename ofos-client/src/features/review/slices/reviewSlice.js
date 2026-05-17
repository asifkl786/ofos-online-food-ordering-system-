import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { reviewService } from '../services/reviewService';
import toast from 'react-hot-toast';

// Async Thunks
export const addReview = createAsyncThunk(
  'review/add',
  async (reviewData, { rejectWithValue }) => {
    try {
      const response = await reviewService.addReview(reviewData);
      toast.success('Review submitted successfully!');
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to submit review';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const updateReview = createAsyncThunk(
  'review/update',
  async ({ reviewId, reviewData }, { rejectWithValue }) => {
    try {
      const response = await reviewService.updateReview(reviewId, reviewData);
      toast.success('Review updated successfully!');
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update review';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const deleteReview = createAsyncThunk(
  'review/delete',
  async (reviewId, { rejectWithValue }) => {
    try {
      await reviewService.deleteReview(reviewId);
      toast.success('Review deleted successfully!');
      return reviewId;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete review';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const fetchRestaurantReviews = createAsyncThunk(
  'review/fetchRestaurantReviews',
  async ({ restaurantId, page, size }, { rejectWithValue }) => {
    try {
      const response = await reviewService.getRestaurantReviews(restaurantId, page, size);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const fetchRatingSummary = createAsyncThunk(
  'review/fetchRatingSummary',
  async (restaurantId, { rejectWithValue }) => {
    try {
      const response = await reviewService.getRatingSummary(restaurantId);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const fetchUserReviews = createAsyncThunk(
  'review/fetchUserReviews',
  async ({ page, size }, { rejectWithValue }) => {
    try {
      const response = await reviewService.getUserReviews(page, size);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const voteHelpful = createAsyncThunk(
  'review/voteHelpful',
  async ({ reviewId, isHelpful }, { rejectWithValue }) => {
    try {
      const response = await reviewService.voteHelpful(reviewId, isHelpful);
      toast.success('Thank you for your feedback!');
      return { reviewId, isHelpful, data: response.data.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to vote';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const checkCanReview = createAsyncThunk(
  'review/checkCanReview',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await reviewService.canReview(orderId);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

const initialState = {
  reviews: [],
  ratingSummary: null,
  userReviews: [],
  canReview: false,
  isLoading: false,
  error: null,
  pagination: {
    totalElements: 0,
    totalPages: 0,
    currentPage: 0,
    pageSize: 10,
  },
};

const reviewSlice = createSlice({
  name: 'review',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearReviews: (state) => {
      state.reviews = [];
      state.ratingSummary = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Add Review
      .addCase(addReview.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(addReview.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(addReview.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update Review
      .addCase(updateReview.fulfilled, (state, action) => {
        const replaceReview = (review) => review.id === action.payload.id ? action.payload : review;
        state.reviews = state.reviews.map(replaceReview);
        state.userReviews = state.userReviews.map(replaceReview);
      })
      // Delete Review
      .addCase(deleteReview.fulfilled, (state, action) => {
        state.reviews = state.reviews.filter((review) => review.id !== action.payload);
        state.userReviews = state.userReviews.filter((review) => review.id !== action.payload);
        if (state.pagination.totalElements > 0) state.pagination.totalElements -= 1;
      })
      // Fetch Restaurant Reviews
      .addCase(fetchRestaurantReviews.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchRestaurantReviews.fulfilled, (state, action) => {
        state.isLoading = false;
        state.reviews = action.payload.content || [];
        state.pagination = {
          totalElements: action.payload.totalElements || 0,
          totalPages: action.payload.totalPages || 0,
          currentPage: action.payload.number || 0,
          pageSize: action.payload.size || 10,
        };
      })
      .addCase(fetchRestaurantReviews.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch Rating Summary
      .addCase(fetchRatingSummary.fulfilled, (state, action) => {
        state.ratingSummary = action.payload;
      })
      // Fetch User Reviews
      .addCase(fetchUserReviews.fulfilled, (state, action) => {
        state.userReviews = action.payload.content || [];
      })
      // Check Can Review
      .addCase(checkCanReview.fulfilled, (state, action) => {
        state.canReview = action.payload;
      });
  },
});

export const { clearError, clearReviews } = reviewSlice.actions;
export default reviewSlice.reducer;
