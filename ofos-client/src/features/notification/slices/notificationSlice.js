import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { notificationService } from '../services/notificationService';
import toast from 'react-hot-toast';

// Async Thunks
export const fetchNotifications = createAsyncThunk(
  'notification/fetchAll',
  async ({ page = 0, size = 20 } = {}, { rejectWithValue }) => {
    try {
      const response = await notificationService.getNotifications(page, size);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const deleteNotification = createAsyncThunk(
  'notification/delete',
  async (notificationId, { rejectWithValue, dispatch }) => {
    try {
      await notificationService.deleteNotification(notificationId);
      toast.success('Notification deleted');
      dispatch(fetchUnreadCount());
      return notificationId;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete notification';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const fetchUnreadCount = createAsyncThunk(
  'notification/fetchUnreadCount',
  async (_, { rejectWithValue }) => {
    try {
      const response = await notificationService.getUnreadCount();
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const markAsRead = createAsyncThunk(
  'notification/markAsRead',
  async (notificationId, { rejectWithValue, dispatch }) => {
    try {
      const response = await notificationService.markAsRead(notificationId);
      dispatch(fetchUnreadCount());
      dispatch(fetchNotifications({ page: 0, size: 20 }));
      return { notificationId, data: response.data.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const markAllAsRead = createAsyncThunk(
  'notification/markAllAsRead',
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const response = await notificationService.markAllAsRead();
      toast.success('All notifications marked as read');
      dispatch(fetchUnreadCount());
      dispatch(fetchNotifications({ page: 0, size: 20 }));
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to mark all as read';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const fetchPreferences = createAsyncThunk(
  'notification/fetchPreferences',
  async (_, { rejectWithValue }) => {
    try {
      const response = await notificationService.getPreferences();
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const updatePreferences = createAsyncThunk(
  'notification/updatePreferences',
  async (preferences, { rejectWithValue, dispatch }) => {
    try {
      const response = await notificationService.updatePreferences(preferences);
      toast.success('Preferences updated');
      dispatch(fetchPreferences());
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update preferences';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

const initialState = {
  notifications: [],
  unreadCount: 0,
  preferences: null,
  isLoading: false,
  error: null,
  pagination: {
    totalElements: 0,
    totalPages: 0,
    currentPage: 0,
    pageSize: 20,
  },
};

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    addLocalNotification: (state, action) => {
      const incoming = action.payload;
      const exists = state.notifications.some((notification) => notification.id === incoming.id);
      if (!exists) {
        state.notifications.unshift(incoming);
        if (!incoming.isRead) {
          state.unreadCount += 1;
        }
      }
    },
    clearNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Notifications
      .addCase(fetchNotifications.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.notifications = action.payload.content || [];
        state.pagination = {
          totalElements: action.payload.totalElements || 0,
          totalPages: action.payload.totalPages || 0,
          currentPage: action.payload.number || 0,
          pageSize: action.payload.size || 20,
        };
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch Unread Count
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      })
      // Mark as Read
      .addCase(markAsRead.fulfilled, (state, action) => {
        const notification = state.notifications.find(n => n.id === action.payload.notificationId);
        if (notification) {
          notification.isRead = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      // Fetch Preferences
      .addCase(fetchPreferences.fulfilled, (state, action) => {
        state.preferences = action.payload;
      })
      // Mark All as Read
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.notifications.forEach(n => n.isRead = true);
        state.unreadCount = 0;
      })
      // Delete Notification
      .addCase(deleteNotification.fulfilled, (state, action) => {
        const removed = state.notifications.find(n => n.id === action.payload);
        state.notifications = state.notifications.filter(n => n.id !== action.payload);
        if (removed && !removed.isRead) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      });
  },
});

export const { clearError, addLocalNotification, clearNotifications } = notificationSlice.actions;
export default notificationSlice.reducer;
