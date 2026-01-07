import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Platform } from 'react-native';
import { useNotificationStore, Notification } from '../store/notificationStore';
import { useAuthStore } from '../store/authStore';
import { setBadgeCount } from '../services/notificationService';

declare const __DEV__: boolean;

const getSocketURL = () => {
  if (__DEV__) {
    if (Platform.OS === 'ios') return 'http://localhost:3001';
    if (Platform.OS === 'android') return 'http://10.0.2.2:3001';
    return 'http://localhost:3001';
  }
  return 'https://kreels-ltntt.ondigitalocean.app';
};

interface NotificationPayload {
  notification: Notification;
  unreadCount: number;
}

export function useNotificationSocket() {
  const socketRef = useRef<Socket | null>(null);
  const { token, isAuthenticated } = useAuthStore();
  const { addNotification, setUnreadCount } = useNotificationStore();

  useEffect(() => {
    if (!isAuthenticated || !token) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    // Initialize socket connection
    socketRef.current = io(getSocketURL(), {
      transports: ['websocket'],
      autoConnect: true,
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('Socket connected for notifications');
      // Authenticate socket connection
      socket.emit('authenticate', token);
    });

    socket.on('notification', (payload: NotificationPayload) => {
      console.log('Received notification:', payload);
      addNotification(payload.notification);
      setUnreadCount(payload.unreadCount);
      setBadgeCount(payload.unreadCount);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    socket.on('error', (error: Error) => {
      console.error('Socket error:', error);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [isAuthenticated, token, addNotification, setUnreadCount]);

  return socketRef.current;
}
