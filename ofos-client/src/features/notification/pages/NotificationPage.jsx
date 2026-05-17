import { useEffect } from 'react';
import { useNotification } from '../hooks/useNotification';
import NotificationItem from '../components/NotificationItem';
import NotificationSkeleton from '../components/NotificationSkeleton';
import { FiBell, FiCheckCircle, FiTrash2 } from 'react-icons/fi';

export default function NotificationPage() {
  const { 
    notifications, 
    isLoading, 
    pagination, 
    unreadCount,
    getNotifications, 
    markNotificationAsRead, 
    markAllNotificationsAsRead,
    deleteUserNotification,
    clearAllNotifications
  } = useNotification();

  useEffect(() => {
    getNotifications(0, 20);
  }, []);

  const handleMarkAsRead = async (id) => {
    await markNotificationAsRead(id);
  };

  const handleMarkAllAsRead = async () => {
    await markAllNotificationsAsRead();
  };

  const handleDelete = async (id) => {
    await deleteUserNotification(id);
  };

  const handleLoadMore = () => {
    if (pagination.currentPage + 1 < pagination.totalPages) {
      getNotifications(pagination.currentPage + 1, pagination.pageSize);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <FiBell className="text-orange-500" /> Notifications
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              {unreadCount} unread notifications
            </p>
          </div>
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="flex items-center gap-2 px-4 py-2 text-sm text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
              >
                <FiCheckCircle className="w-4 h-4" /> Mark all as read
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        {isLoading ? (
          <NotificationSkeleton count={5} />
        ) : notifications && notifications.length > 0 ? (
          <div className="bg-white rounded-2xl shadow-md overflow-hidden">
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
          <div className="bg-white rounded-2xl shadow-md p-12 text-center">
            <div className="text-6xl mb-4">🔔</div>
            <h3 className="text-lg font-semibold text-gray-700">No notifications yet</h3>
            <p className="text-gray-500 text-sm mt-2">
              When you receive notifications, they'll appear here
            </p>
          </div>
        )}

        {/* Load More */}
        {!isLoading && notifications.length > 0 && pagination.currentPage + 1 < pagination.totalPages && (
          <div className="text-center mt-6">
            <button
              onClick={handleLoadMore}
              className="px-6 py-2 border border-orange-500 text-orange-500 rounded-lg hover:bg-orange-500 hover:text-white transition-colors"
            >
              Load More
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
