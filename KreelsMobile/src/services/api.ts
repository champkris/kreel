import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { User, Video, Comment } from '../types';

// Dynamic API URL based on platform
const getAPIBaseURL = () => {
  if (__DEV__) {
    if (Platform.OS === 'ios') {
      // For iOS Simulator, use localhost
      return 'http://localhost:3001/api';
    } else if (Platform.OS === 'android') {
      // For Android Emulator, use special IP
      return 'http://10.0.2.2:3001/api';
    } else if (Platform.OS === 'web') {
      // For web dev, use localhost
      return 'http://localhost:3001/api';
    } else {
      // For physical devices, use computer's IP
      return 'http://192.168.1.43:3001/api';
    }
  } else {
    // Production URL - use relative path since API is on same domain
    if (Platform.OS === 'web') {
      return '/api';
    }
    // For mobile production, use the DO app URL
    return 'https://kreels-api-xxxxx.ondigitalocean.app/api';
  }
};

const API_BASE_URL = getAPIBaseURL();

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      await AsyncStorage.removeItem('authToken');
      // Handle logout logic here
    }
    return Promise.reject(error);
  }
);
// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    // API returns { success, data: { user, token } }, extract the data
    return response.data.data || response.data;
  },

  register: async (userData: {
    email: string;
    password: string;
    username: string;
    displayName: string;
  }) => {
    const response = await api.post('/auth/register', userData);
    // API returns { success, data: { user, token } }, extract the data
    return response.data.data || response.data;
  },
  
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// Videos API
export const videosAPI = {
  getFeed: async (page = 1, limit = 10): Promise<Video[]> => {
    const response = await api.get(`/videos/feed?page=${page}&limit=${limit}`);
    return response.data;
  },
  
  getVideo: async (id: string): Promise<Video> => {
    const response = await api.get(`/videos/${id}`);
    return response.data;
  },
  
  uploadVideo: async (formData: FormData) => {
    const response = await api.post('/videos/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  likeVideo: async (videoId: string) => {
    const response = await api.post(`/videos/${videoId}/like`);
    return response.data;
  },
  
  shareVideo: async (videoId: string) => {
    const response = await api.post(`/videos/${videoId}/share`);
    return response.data;
  },
};

export default api;