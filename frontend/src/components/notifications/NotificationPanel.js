import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiBell,
  FiX,
  FiCheck,
  FiTrash2,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiInfo,
  FiAlertTriangle,
} from 'react-icons/fi';
import { useNotifications } from '../../contexts/NotificationContext';
import { formatDistanceToNow } from 'date-fns';
import LoadingSpinner from '../ui/LoadingSpinner';

const NotificationPanel = ({ onClose }) => {
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  const [filter, setFilter] = useState('all'); // all, unread, read

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.isRead;
    if (filter === 'read') return notification.isRead;
    return true;
  });

  const getNotificationIcon = (type) => {
    const iconClasses = 'w-5 h-5';
    switch (type) {
      case 'success':
        return <FiCheckCircle className={`${iconClasses} text-success-600`} />;
      case 'error':
        return <FiAlertCircle className={`${iconClasses} text-error-600`} />;
      case 'warning':
        return <FiAlertTriangle className={`${iconClasses} text-warning-600`} />;
      default:
        return <FiInfo className={`${iconClasses} text-primary-600`} />;
    }
  };

  const getNotificationBgColor = (type) => {
    switch (type) {
      case 'success':
        return 'bg-success-50 border-success-200';
      case 'error':
        return 'bg-error-50 border-error-200';
      case 'warning':
        return 'bg-warning-50 border-warning-200';
      default:
        return 'bg-primary-50 border-primary-200';
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    await markAsRead(notificationId);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const handleDelete = async (notificationId, e) => {
    e.stopPropagation();
    await deleteNotification(notificationId);
  };

  const panelVariants = {
    open: {
      opacity: 1,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30,
      },
    },
    closed: {
      opacity: 0,
      scale: 0.95,
      transition: {
        duration: 0.2,
      },
    },
  };

  const notificationVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
  };

  return (
    <motion.div
      variants={panelVariants}
      initial="closed"
      animate="open"
      exit="closed"
      className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl ring-1 ring-black ring-opacity-5 z-50 max-h-96 flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <FiBell className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
          {unreadCount > 0 && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
              {unreadCount}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
        >
          <FiX className="w-5 h-5" />
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setFilter('all')}
          className={`flex-1 px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
            filter === 'all'
              ? 'border-primary-500 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`flex-1 px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
            filter === 'unread'
              ? 'border-primary-500 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Unread
        </button>
        <button
          onClick={() => setFilter('read')}
          className={`flex-1 px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
            filter === 'read'
              ? 'border-primary-500 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Read
        </button>
      </div>

      {/* Mark all as read button */}
      {unreadCount > 0 && (
        <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
          <button
            onClick={handleMarkAllAsRead}
            className="text-sm text-primary-600 hover:text-primary-800 font-medium flex items-center"
          >
            <FiCheck className="w-4 h-4 mr-1" />
            Mark all as read
          </button>
        </div>
      )}

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner size="md" />
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="text-center py-8">
            <FiBell className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">
              {filter === 'unread' ? 'No unread notifications' : 
               filter === 'read' ? 'No read notifications' : 
               'No notifications'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            <AnimatePresence>
              {filteredNotifications.map((notification) => (
                <motion.div
                  key={notification._id}
                  variants={notificationVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  layout
                  onClick={() => !notification.isRead && handleMarkAsRead(notification._id)}
                  className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                    !notification.isRead ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-full border ${getNotificationBgColor(notification.type)}`}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${
                            !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                          }`}>
                            {notification.title}
                          </p>
                          <p className={`text-sm mt-1 ${
                            !notification.isRead ? 'text-gray-800' : 'text-gray-600'
                          }`}>
                            {notification.message}
                          </p>
                          <div className="flex items-center mt-2 text-xs text-gray-500">
                            <FiClock className="w-3 h-3 mr-1" />
                            {formatDistanceToNow(new Date(notification.createdAt), {
                              addSuffix: true,
                            })}
                          </div>
                        </div>
                        <div className="flex items-center space-x-1 ml-2">
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-primary-600 rounded-full" />
                          )}
                          <button
                            onClick={(e) => handleDelete(notification._id, e)}
                            className="text-gray-400 hover:text-red-600 p-1 rounded hover:bg-red-50"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-200 bg-gray-50">
        <button
          onClick={() => window.location.href = '/notifications'}
          className="w-full text-center text-sm text-primary-600 hover:text-primary-800 font-medium"
        >
          View all notifications
        </button>
      </div>
    </motion.div>
  );
};

export default NotificationPanel;
