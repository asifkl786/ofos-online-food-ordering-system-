import { formatNotificationTime, getNotificationIcon, getNotificationColor, getNotificationTypeLabel } from '../utils/notificationHelpers';
import { FiX } from 'react-icons/fi';

export default function NotificationItem({ notification, onMarkAsRead, onDelete }) {
  const isRead = notification.isRead;
  const icon = getNotificationIcon(notification.type);
  const colorClass = getNotificationColor(notification.type);
  const timeAgo = formatNotificationTime(notification.createdAt);
  const typeLabel = getNotificationTypeLabel(notification.type);

  const handleClick = () => {
    if (!isRead && onMarkAsRead) {
      onMarkAsRead(notification.id);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`flex items-start gap-3 p-4 border-b border-gray-100 cursor-pointer transition-all hover:bg-gray-50 ${
        !isRead ? 'bg-orange-50/30' : ''
      }`}
    >
      {/* Icon */}
      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl shrink-0 ${colorClass}`}>
        {icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <p className={`text-sm font-medium ${!isRead ? 'text-gray-900' : 'text-gray-600'}`}>
              {notification.title}
            </p>
            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notification.message}</p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-xs text-gray-400">{timeAgo}</span>
              <span className="text-xs text-gray-300">•</span>
              <span className="text-xs text-gray-400">{typeLabel}</span>
            </div>
          </div>
          {!isRead && (
            <div className="w-2 h-2 bg-orange-500 rounded-full shrink-0 mt-1.5"></div>
          )}
        </div>
      </div>

      {/* Delete Button */}
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(notification.id);
          }}
          className="text-gray-400 hover:text-red-500 transition-colors shrink-0"
        >
          <FiX className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}