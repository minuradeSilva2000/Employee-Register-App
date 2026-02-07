import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

// Create Socket.io context
const SocketContext = createContext();

/**
 * Socket Provider - Handles real-time WebSocket connections
 * 
 * Features:
 * - Auto-reconnection with exponential backoff
 * - Connection status monitoring
 * - Event handling for real-time updates
 * - Automatic cleanup on unmount
 */
export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  useEffect(() => {
    // Initialize Socket.io connection
    const newSocket = io(process.env.REACT_APP_SERVER_URL || 'http://localhost:5000', {
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      maxReconnectionAttempts: 5,
      timeout: 20000,
      transports: ['websocket', 'polling'],
    });

    // Connection event handlers
    newSocket.on('connect', () => {
      console.log('🔌 Socket connected');
      setIsConnected(true);
      setConnectionStatus('connected');
      setReconnectAttempts(0);
      toast.success('Real-time connection established', {
        icon: '🔌',
        duration: 2000,
      });
    });

    newSocket.on('disconnect', (reason) => {
      console.log('🔌 Socket disconnected:', reason);
      setIsConnected(false);
      setConnectionStatus('disconnected');
      
      if (reason === 'io server disconnect') {
        // Server initiated disconnect, don't reconnect automatically
        toast.error('Server disconnected', {
          icon: '❌',
          duration: 3000,
        });
      }
    });

    newSocket.on('connect_error', (error) => {
      console.error('🔌 Socket connection error:', error);
      setIsConnected(false);
      setConnectionStatus('error');
      setReconnectAttempts(prev => prev + 1);
      
      if (reconnectAttempts < 3) {
        toast.error(`Connection failed... Retrying (${reconnectAttempts + 1}/5)`, {
          icon: '🔄',
          duration: 2000,
        });
      }
    });

    newSocket.on('reconnect', (attemptNumber) => {
      console.log('🔌 Socket reconnected after', attemptNumber, 'attempts');
      setIsConnected(true);
      setConnectionStatus('connected');
      toast.success('Connection restored', {
        icon: '🔌',
        duration: 2000,
      });
    });

    newSocket.on('reconnect_error', (error) => {
      console.error('🔌 Socket reconnection error:', error);
      setConnectionStatus('error');
      
      if (reconnectAttempts >= 4) {
        toast.error('Unable to establish connection. Please refresh the page.', {
          icon: '❌',
          duration: 5000,
        });
      }
    });

    // Real-time event handlers
    newSocket.on('notification', (notification) => {
      console.log('📢 Real-time notification:', notification);
      
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

      // Trigger custom event for components to listen to
      window.dispatchEvent(new CustomEvent('realtime-notification', {
        detail: notification
      }));
    });

    newSocket.on('employee_update', (data) => {
      console.log('👤 Employee update:', data);
      window.dispatchEvent(new CustomEvent('employee-update', {
        detail: data
      }));
    });

    newSocket.on('department_update', (data) => {
      console.log('🏢 Department update:', data);
      window.dispatchEvent(new CustomEvent('department-update', {
        detail: data
      }));
    });

    newSocket.on('attendance_update', (data) => {
      console.log('📅 Attendance update:', data);
      window.dispatchEvent(new CustomEvent('attendance-update', {
        detail: data
      }));
    });

    newSocket.on('user_update', (data) => {
      console.log('👤 User update:', data);
      window.dispatchEvent(new CustomEvent('user-update', {
        detail: data
      }));
    });

    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      if (newSocket) {
        newSocket.disconnect();
        console.log('🔌 Socket disconnected (cleanup)');
      }
    };
  }, [reconnectAttempts]);

  // Emit events helper
  const emitEvent = (event, data) => {
    if (socket && isConnected) {
      socket.emit(event, data);
      console.log('📡 Emitting event:', event, data);
    } else {
      console.warn('📡 Cannot emit event - socket not connected:', event);
    }
  };

  // Join room helper
  const joinRoom = (room) => {
    if (socket && isConnected) {
      socket.emit('join-room', room);
      console.log('📡 Joined room:', room);
    }
  };

  // Leave room helper
  const leaveRoom = (room) => {
    if (socket && isConnected) {
      socket.emit('leave-room', room);
      console.log('📡 Left room:', room);
    }
  };

  const value = {
    socket,
    isConnected,
    connectionStatus,
    reconnectAttempts,
    emitEvent,
    joinRoom,
    leaveRoom,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

// Custom hook to use socket context
export const useSocket = () => {
  const context = useContext(SocketContext);
  
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  
  return context;
};

export default SocketContext;
