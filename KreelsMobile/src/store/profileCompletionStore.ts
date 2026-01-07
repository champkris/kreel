import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { usersAPI } from '../services/api';

const LAST_REMINDER_KEY = 'profile_completion_last_reminder';
const REMINDER_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours

interface ProfileCompletionStore {
  percentage: number;
  completedFields: string[];
  missingFields: string[];
  isComplete: boolean;
  isLoading: boolean;
  lastReminderShown: string | null;
  showPopup: boolean;

  // Actions
  fetchCompletion: () => Promise<void>;
  shouldShowReminder: () => boolean;
  markReminderShown: () => Promise<void>;
  loadLastReminderTime: () => Promise<void>;
  setShowPopup: (show: boolean) => void;
  reset: () => void;
}

export const useProfileCompletionStore = create<ProfileCompletionStore>((set, get) => ({
  percentage: 0,
  completedFields: [],
  missingFields: [],
  isComplete: false,
  isLoading: false,
  lastReminderShown: null,
  showPopup: false,

  fetchCompletion: async () => {
    set({ isLoading: true });
    try {
      const response = await usersAPI.getProfileCompletion();
      if (response.success && response.data) {
        set({
          percentage: response.data.percentage,
          completedFields: response.data.completedFields,
          missingFields: response.data.missingFields,
          isComplete: response.data.isComplete,
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Error fetching profile completion:', error);
      set({ isLoading: false });
    }
  },

  shouldShowReminder: () => {
    const state = get();

    // Don't show if profile is complete
    if (state.isComplete) {
      return false;
    }

    // Don't show if we're still loading
    if (state.isLoading) {
      return false;
    }

    // Check if enough time has passed since last reminder
    if (state.lastReminderShown) {
      const lastShown = new Date(state.lastReminderShown).getTime();
      const now = Date.now();
      if (now - lastShown < REMINDER_INTERVAL_MS) {
        return false;
      }
    }

    return true;
  },

  markReminderShown: async () => {
    const now = new Date().toISOString();
    try {
      await AsyncStorage.setItem(LAST_REMINDER_KEY, now);
      set({ lastReminderShown: now, showPopup: false });
    } catch (error) {
      console.error('Error saving reminder time:', error);
    }
  },

  loadLastReminderTime: async () => {
    try {
      const lastReminder = await AsyncStorage.getItem(LAST_REMINDER_KEY);
      if (lastReminder) {
        set({ lastReminderShown: lastReminder });
      }
    } catch (error) {
      console.error('Error loading last reminder time:', error);
    }
  },

  setShowPopup: (show) => set({ showPopup: show }),

  reset: () =>
    set({
      percentage: 0,
      completedFields: [],
      missingFields: [],
      isComplete: false,
      isLoading: false,
      showPopup: false,
    }),
}));

// Field labels for display
export const PROFILE_FIELD_LABELS: Record<string, string> = {
  username: 'Username',
  displayName: 'Display Name',
  avatar: 'Profile Photo',
  bio: 'Bio',
  dateOfBirth: 'Date of Birth',
  gender: 'Gender',
  country: 'Country',
};

// Field icons (Ionicons names)
export const PROFILE_FIELD_ICONS: Record<string, string> = {
  username: 'at-outline',
  displayName: 'person-outline',
  avatar: 'camera-outline',
  bio: 'document-text-outline',
  dateOfBirth: 'calendar-outline',
  gender: 'people-outline',
  country: 'globe-outline',
};
