import React, { useEffect, useState, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
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
import { useProfileCompletionStore } from './src/store/profileCompletionStore';
import { ProfileCompletionPopup } from './src/components/profile';
import { useNavigation, NavigationContainerRef } from '@react-navigation/native';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

// Navigation ref for profile completion navigation
export const navigationRef = React.createRef<NavigationContainerRef<any> | null>();

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

// Profile completion popup manager
function ProfileCompletionManager() {
  const { isAuthenticated } = useAuthStore();
  const {
    fetchCompletion,
    loadLastReminderTime,
    shouldShowReminder,
    showPopup,
    setShowPopup,
    isComplete,
  } = useProfileCompletionStore();
  const appState = useRef(AppState.currentState);
  const hasCheckedOnMount = useRef(false);

  // Load last reminder time and check completion on mount
  useEffect(() => {
    if (isAuthenticated && !hasCheckedOnMount.current) {
      hasCheckedOnMount.current = true;
      initializeProfileCompletion();
    }
  }, [isAuthenticated]);

  // Listen for app state changes
  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, [isAuthenticated]);

  const initializeProfileCompletion = async () => {
    await loadLastReminderTime();
    await fetchCompletion();
    // Small delay to ensure data is loaded before checking
    setTimeout(() => {
      if (shouldShowReminder()) {
        setShowPopup(true);
      }
    }, 1500);
  };

  const handleAppStateChange = async (nextAppState: AppStateStatus) => {
    if (
      appState.current.match(/inactive|background/) &&
      nextAppState === 'active' &&
      isAuthenticated
    ) {
      // App has come to the foreground
      await fetchCompletion();
      if (shouldShowReminder()) {
        setShowPopup(true);
      }
    }
    appState.current = nextAppState;
  };

  const handleCompleteProfile = () => {
    setShowPopup(false);
    // Navigate to PersonalInfo screen
    if (navigationRef.current) {
      navigationRef.current.navigate('PersonalInfo');
    }
  };

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  if (!isAuthenticated || isComplete) {
    return null;
  }

  return (
    <ProfileCompletionPopup
      visible={showPopup}
      onClose={handleClosePopup}
      onCompleteProfile={handleCompleteProfile}
    />
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <NotificationInitializer />
        <AppNavigator navigationRef={navigationRef} />
        <ProfileCompletionManager />
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}