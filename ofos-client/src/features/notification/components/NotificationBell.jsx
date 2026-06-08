import { useEffect, useState, useRef } from 'react';
import { FiBell } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import NotificationList from './NotificationList';
import { useNotification } from '../hooks/useNotification';
import { API_BASE_URL } from '../../../api/axiosConfig';
import { useAuth } from '../../auth/hooks/useAuth';

export default function NotificationBell() {
  const { unreadCount, getUnreadCount, getNotifications, addNotification, notifications, isLoading } = useNotification();
  const { isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const closeTimerRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated) {
      return undefined;
    }

    getUnreadCount();
    const refreshTimer = setInterval(getUnreadCount, 30000);
    return () => clearInterval(refreshTimer);
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      return undefined;
    }

    const token = localStorage.getItem('accessToken');
    if (!token || typeof EventSource === 'undefined') {
      return undefined;
    }

    const streamUrl = `${API_BASE_URL.replace(/\/$/, '')}/notifications/stream?token=${encodeURIComponent(token)}`;
    const source = new EventSource(streamUrl);

    source.addEventListener('notification', (event) => {
      try {
        const notification = JSON.parse(event.data);
        addNotification(notification);
      } catch (error) {
        getUnreadCount();
      }
    });

    // Keep the old polling as a fallback, but live stream gives users immediate navbar updates.
    source.onerror = () => {
      getUnreadCount();
    };

    return () => source.close();
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && isOpen) {
      getNotifications(0, 20);
    }
  }, [isAuthenticated, isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  const openDropdown = () => {
    if (!isAuthenticated) return;
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
    }
    setIsOpen(true);
  };

  const closeDropdownWithDelay = () => {
    closeTimerRef.current = setTimeout(() => setIsOpen(false), 140);
  };

  if (!isAuthenticated) return null;

  return (
    <div className="relative" onMouseEnter={openDropdown} onMouseLeave={closeDropdownWithDelay}>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="relative cursor-pointer p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
      >
        <FiBell className="w-5 h-5" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50"
          >
            <NotificationList
              notifications={notifications}
              isLoading={isLoading}
              onClose={() => setIsOpen(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
