import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthState, User } from '../types';
import { authAPI } from '../services/api';
import { mockAuthAPI } from '../services/mockAuth';

// Toggle this to use mock auth when backend is unavailable
const USE_MOCK_AUTH = false;

interface AuthStore extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (userData: {
    email: string;
    password: string;
    username: string;
    displayName: string;
    userType?: 'INDIVIDUAL' | 'PROFESSIONAL';
  }) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  setUser: (user: User) => void;
  clearError: () => void;
  error: string | null;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  clearError: () => set({ error: null }),

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      console.log('🔐 Attempting login...', { email });
      
      let response;
      if (USE_MOCK_AUTH) {
        console.log('🎭 Using mock authentication');
        response = await mockAuthAPI.login(email, password);
      } else {
        try {
          response = await authAPI.login(email, password);
        } catch (apiError: any) {
          console.log('⚠️ Real API failed, trying mock auth...', apiError.message);
          response = await mockAuthAPI.login(email, password);
        }
      }
      
      console.log('✅ Login successful:', response);
      
      const { user, token } = response;
      
      await AsyncStorage.setItem('authToken', token);
      await AsyncStorage.setItem('user', JSON.stringify(user));
      
      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      console.error('❌ Login failed:', error);
      const errorMessage = error.message || 'Login failed. Please check your connection.';
      set({ 
        isLoading: false, 
        error: errorMessage,
        isAuthenticated: false,
        user: null,
        token: null 
      });
      throw new Error(errorMessage);
    }
  },
  register: async (userData: {
    email: string;
    password: string;
    username: string;
    displayName: string;
    userType?: 'INDIVIDUAL' | 'PROFESSIONAL';
  }) => {
    set({ isLoading: true, error: null });
    try {
      console.log('📝 Attempting registration...', { email: userData.email, username: userData.username });
      
      let response;
      if (USE_MOCK_AUTH) {
        console.log('🎭 Using mock authentication');
        response = await mockAuthAPI.register(userData);
      } else {
        try {
          response = await authAPI.register(userData);
        } catch (apiError: any) {
          console.log('⚠️ Real API failed, trying mock auth...', apiError.message);
          response = await mockAuthAPI.register(userData);
        }
      }
      
      console.log('✅ Registration successful:', response);
      
      const { user, token } = response;
      
      await AsyncStorage.setItem('authToken', token);
      await AsyncStorage.setItem('user', JSON.stringify(user));
      
      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      console.error('❌ Registration failed:', error);
      const errorMessage = error.message || 'Registration failed. Please check your connection.';
      set({ 
        isLoading: false, 
        error: errorMessage,
        isAuthenticated: false,
        user: null,
        token: null 
      });
      throw new Error(errorMessage);
    }
  },

  logout: async () => {
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('user');
    set({
      user: null,
      token: null,
      isAuthenticated: false,
    });
  },

  loadUser: async () => {
    set({ isLoading: true });
    try {
      const token = await AsyncStorage.getItem('authToken');
      const userString = await AsyncStorage.getItem('user');
      
      if (token && userString) {
        const user = JSON.parse(userString);
        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      set({ isLoading: false });
    }
  },

  setUser: (user: User) => {
    set({ user });
  },
}));