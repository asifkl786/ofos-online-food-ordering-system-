import { useDispatch, useSelector } from 'react-redux';
import {
  fetchNotifications,
  fetchUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  fetchPreferences,
  updatePreferences,
  clearNotifications,
  addLocalNotification,
} from '../slices/notificationSlice';

export const useNotification = () => {
  const dispatch = useDispatch();
  const { notifications, unreadCount, preferences, isLoading, error, pagination } = useSelector(
    (state) => state.notification
  );

  const getNotifications = (page = 0, size = 20) => {
    dispatch(fetchNotifications({ page, size }));
  };

  const getUnreadCount = () => {
    dispatch(fetchUnreadCount());
  };

  const markNotificationAsRead = (notificationId) => {
    return dispatch(markAsRead(notificationId));
  };

  const markAllNotificationsAsRead = () => {
    return dispatch(markAllAsRead());
  };

  const deleteUserNotification = (notificationId) => {
    return dispatch(deleteNotification(notificationId));
  };

  const getPreferences = () => {
    dispatch(fetchPreferences());
  };

  const updateUserPreferences = (preferences) => {
    return dispatch(updatePreferences(preferences));
  };

  const clearAllNotifications = () => {
    dispatch(clearNotifications());
  };

  const addNotification = (notification) => {
    dispatch(addLocalNotification(notification));
  };

  return {
    // State
    notifications,
    unreadCount,
    preferences,
    isLoading,
    error,
    pagination,
    
    // Actions
    getNotifications,
    getUnreadCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteUserNotification,
    getPreferences,
    updateUserPreferences,
    clearAllNotifications,
    addNotification,
  };
};
