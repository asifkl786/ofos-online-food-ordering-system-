import { useNotification } from '../hooks/useNotification';
import NotificationItem from './NotificationItem';
import NotificationSkeleton from './NotificationSkeleton';
import { FiBell, FiCheckCircle } from 'react-icons/fi';

export default function NotificationList({ notifications, isLoading, onClose }) {
  const { markNotificationAsRead, markAllNotificationsAsRead, deleteUserNotification, unreadCount } = useNotification();

  const handleMarkAsRead = async (notificationId) => {
    await markNotificationAsRead(notificationId);
  };

  const handleMarkAllAsRead = async () => {
    await markAllNotificationsAsRead();
  };

  const handleDelete = async (notificationId) => {
    await deleteUserNotification(notificationId);
  };

  if (isLoading) {
    return (
      <div className="p-2">
        <NotificationSkeleton count={5} />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <FiBell className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-800">Notifications</h3>
          {unreadCount > 0 && (
            <span className="text-xs bg-orange-500 text-white px-2 py-0.5 rounded-full">
              {unreadCount} new
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="flex items-center gap-1 text-xs text-orange-500 hover:text-orange-600 transition-colors"
          >
            <FiCheckCircle className="w-3 h-3" /> Mark all as read
          </button>
        )}
      </div>

      {/* Notifications List */}
      {notifications && notifications.length > 0 ? (
        <div className="max-h-96 overflow-y-auto">
          {notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onMarkAsRead={handleMarkAsRead}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-5xl mb-3">🔔</div>
          <p className="text-gray-500 text-sm">No notifications yet</p>
          <p className="text-xs text-gray-400 mt-1">When you receive notifications, they'll appear here</p>
        </div>
      )}

      {/* Footer */}
      <div className="p-3 border-t border-gray-100 text-center">
        <button
          onClick={() => {
            onClose();
            window.location.href = '/notifications';
          }}
          className="text-xs text-orange-500 hover:text-orange-600 transition-colors"
        >
          View all notifications →
        </button>
      </div>
    </div>
  );
}
