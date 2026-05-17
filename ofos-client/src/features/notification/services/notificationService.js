import api from '../../../api/axiosConfig';

export const notificationService = {
  // Get user notifications
  getNotifications: (page = 0, size = 20) => {
    return api.get('/notifications', { params: { page, size } });
  },

  // Get unread count
  getUnreadCount: () => {
    return api.get('/notifications/unread/count');
  },

  // Mark single notification as read
  markAsRead: (notificationId) => {
    return api.patch(`/notifications/${notificationId}/read`);
  },

  // Mark all notifications as read
  markAllAsRead: () => {
    return api.patch('/notifications/read-all');
  },

  // Get notification preferences
  getPreferences: () => {
    return api.get('/notifications/preferences');
  },

  // Update notification preferences
  updatePreferences: (preferences) => {
    return api.put('/notifications/preferences', preferences);
  },

  // Delete notification
  deleteNotification: (notificationId) => {
    return api.delete(`/notifications/${notificationId}`);
  },
};