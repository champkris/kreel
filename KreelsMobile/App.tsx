import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AppNavigator from './src/navigation/AppNavigator';
import { useAuthStore } from './src/store/authStore';
import { useNotificationSocket } from './src/hooks/useNotifications';
import {
  registerForPushNotifications,
  savePushToken,
  addNotificationResponseListener,
} from './src/services/notificationService';
import { notificationsAPI } from './src/services/api';
import { useNotificationStore } from './src/store/notificationStore';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

// Notification initializer component
function NotificationInitializer() {
  const { isAuthenticated, loadUser } = useAuthStore();
  const { setUnreadCount } = useNotificationStore();

  // Initialize socket connection for real-time notifications
  useNotificationSocket();

  // Load user on app start
  useEffect(() => {
    loadUser();
  }, [loadUser]);

  // Initialize push notifications when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      initializePushNotifications();
      fetchUnreadCount();
    }
  }, [isAuthenticated]);

  const initializePushNotifications = async () => {
    try {
      const token = await registerForPushNotifications();
      if (token) {
        await savePushToken(token);
      }
    } catch (error) {
      console.error('Error initializing push notifications:', error);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await notificationsAPI.getUnreadCount();
      if (response.success) {
        setUnreadCount(response.data.count);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  // Handle notification tap (when app is in background/closed)
  useEffect(() => {
    const subscription = addNotificationResponseListener((response) => {
      const data = response.notification.request.content.data;
      console.log('Notification tapped:', data);
      // Navigation will be handled by the NotificationsScreen based on notification type
    });

    return () => subscription.remove();
  }, []);

  return null;
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <NotificationInitializer />
        <AppNavigator />
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}