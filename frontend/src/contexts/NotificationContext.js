import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { notificationAPI } from '../services/api';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

// Initial state
const initialState = {
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
};

// Action types
const NOTIFICATION_ACTIONS = {
  FETCH_START: 'FETCH_START',
  FETCH_SUCCESS: 'FETCH_SUCCESS',
  FETCH_FAILURE: 'FETCH_FAILURE',
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  MARK_AS_READ: 'MARK_AS_READ',
  MARK_ALL_AS_READ: 'MARK_ALL_AS_READ',
  DELETE_NOTIFICATION: 'DELETE_NOTIFICATION',
  CLEAR_ERROR: 'CLEAR_ERROR',
};

// Reducer function
const notificationReducer = (state, action) => {
  switch (action.type) {
    case NOTIFICATION_ACTIONS.FETCH_START:
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case NOTIFICATION_ACTIONS.FETCH_SUCCESS:
      const notifications = action.payload.notifications || [];
      const unreadCount = notifications.filter(n => !n.isRead).length;
      
      return {
        ...state,
        notifications,
        unreadCount,
        isLoading: false,
        error: null,
      };

    case NOTIFICATION_ACTIONS.FETCH_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };

    case NOTIFICATION_ACTIONS.ADD_NOTIFICATION:
      const newNotification = action.payload;
      const updatedNotifications = [newNotification, ...state.notifications];
      const newUnreadCount = newNotification.isRead ? state.unreadCount : state.unreadCount + 1;
      
      return {
        ...state,
        notifications: updatedNotifications,
        unreadCount: newUnreadCount,
      };

    case NOTIFICATION_ACTIONS.MARK_AS_READ:
      const { notificationId } = action.payload;
      const markAsReadNotifications = state.notifications.map(notification =>
        notification._id === notificationId
          ? { ...notification, isRead: true, readAt: new Date() }
          : notification
      );
      const markAsReadUnreadCount = markAsReadNotifications.filter(n => !n.isRead).length;
      
      return {
        ...state,
        notifications: markAsReadNotifications,
        unreadCount: markAsReadUnreadCount,
      };

    case NOTIFICATION_ACTIONS.MARK_ALL_AS_READ:
      const markAllAsReadNotifications = state.notifications.map(notification =>
        !notification.isRead ? { ...notification, isRead: true, readAt: new Date() } : notification
      );
      
      return {
        ...state,
        notifications: markAllAsReadNotifications,
        unreadCount: 0,
      };

    case NOTIFICATION_ACTIONS.DELETE_NOTIFICATION:
      const { id: deleteId } = action.payload;
      const deleteNotifications = state.notifications.filter(
        notification => notification._id !== deleteId
      );
      const deleteUnreadCount = deleteNotifications.filter(n => !n.isRead).length;
      
      return {
        ...state,
        notifications: deleteNotifications,
        unreadCount: deleteUnreadCount,
      };

    case NOTIFICATION_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
};

// Create context
const NotificationContext = createContext();

// Notification provider component
export const NotificationProvider = ({ children }) => {
  const [state, dispatch] = useReducer(notificationReducer, initialState);
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user, isAuthenticated } = useAuth();

  // Initialize socket connection
  useEffect(() => {
    if (isAuthenticated && user) {
      const newSocket = io(process.env.REACT_APP_SERVER_URL || 'http://localhost:5000', {
        auth: {
          token: localStorage.getItem('accessToken'),
        },
      });

      newSocket.on('connect', () => {
        console.log('Connected to notification server');
        setIsConnected(true);
        
        // Join user-specific room
        newSocket.emit('join-user-room', user.id);
        
        // Join role-based room
        if (user.role) {
          newSocket.emit('join-role-room', user.role);
        }
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from notification server');
        setIsConnected(false);
      });

      newSocket.on('notification', (notification) => {
        // Add notification to state
        dispatch({
          type: NOTIFICATION_ACTIONS.ADD_NOTIFICATION,
          payload: notification,
        });

        // Show toast notification
        const toastConfig = {
          duration: notification.priority === 'urgent' ? 6000 : 4000,
          position: 'top-right',
        };

        switch (notification.type) {
          case 'success':
            toast.success(notification.message, toastConfig);
            break;
          case 'error':
            toast.error(notification.message, toastConfig);
            break;
          case 'warning':
            toast(notification.message, { ...toastConfig, icon: '⚠️' });
            break;
          default:
            toast(notification.message, toastConfig);
        }
      });

      newSocket.on('error', (error) => {
        console.error('Socket error:', error);
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    } else {
      if (socket) {
        socket.close();
        setSocket(null);
        setIsConnected(false);
      }
    }
  }, [isAuthenticated, user]);

  // Fetch notifications on component mount and when user changes
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchNotifications();
    }
  }, [isAuthenticated, user]);

  // Fetch notifications from API
  const fetchNotifications = async (limit = 50) => {
    try {
      dispatch({ type: NOTIFICATION_ACTIONS.FETCH_START });

      const response = await notificationAPI.getAll({ limit });
      
      if (response.success) {
        dispatch({
          type: NOTIFICATION_ACTIONS.FETCH_SUCCESS,
          payload: {
            notifications: response.data.notifications,
          },
        });
      } else {
        throw new Error(response.message || 'Failed to fetch notifications');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch notifications';
      
      dispatch({
        type: NOTIFICATION_ACTIONS.FETCH_FAILURE,
        payload: errorMessage,
      });
    }
  };

  // Fetch unread notifications
  const fetchUnreadNotifications = async (limit = 20) => {
    try {
      const response = await notificationAPI.getUnread({ limit });
      
      if (response.success) {
        // Add unread notifications to the beginning of the list
        response.data.notifications.forEach(notification => {
          dispatch({
            type: NOTIFICATION_ACTIONS.ADD_NOTIFICATION,
            payload: notification,
          });
        });
      }
    } catch (error) {
      console.error('Failed to fetch unread notifications:', error);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      const response = await notificationAPI.markAsRead(notificationId);
      
      if (response.success) {
        dispatch({
          type: NOTIFICATION_ACTIONS.MARK_AS_READ,
          payload: { notificationId },
        });
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const response = await notificationAPI.markAllAsRead();
      
      if (response.success) {
        dispatch({ type: NOTIFICATION_ACTIONS.MARK_ALL_AS_READ });
        toast.success('All notifications marked as read');
      }
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      toast.error('Failed to mark all notifications as read');
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId) => {
    try {
      const response = await notificationAPI.delete(notificationId);
      
      if (response.success) {
        dispatch({
          type: NOTIFICATION_ACTIONS.DELETE_NOTIFICATION,
          payload: { id: notificationId },
        });
        toast.success('Notification deleted');
      }
    } catch (error) {
      console.error('Failed to delete notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  // Create notification (admin only)
  const createNotification = async (notificationData) => {
    try {
      const response = await notificationAPI.create(notificationData);
      
      if (response.success) {
        toast.success('Notification created successfully');
        return { success: true };
      } else {
        throw new Error(response.message || 'Failed to create notification');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create notification';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: NOTIFICATION_ACTIONS.CLEAR_ERROR });
  };

  // Refresh notifications
  const refreshNotifications = () => {
    fetchNotifications();
  };

  const value = {
    // State
    ...state,
    isConnected,
    
    // Actions
    fetchNotifications,
    fetchUnreadNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    createNotification,
    clearError,
    refreshNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

// Custom hook to use notification context
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  
  return context;
};

export default NotificationContext;
