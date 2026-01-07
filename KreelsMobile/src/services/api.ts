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
    return 'https://kreels-ltntt.ondigitalocean.app/api';
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
  getFeed: async (page = 1, limit = 10) => {
    const response = await api.get(`/videos/feed?page=${page}&limit=${limit}`);
    return response.data;
  },

  getVideo: async (id: string) => {
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

  getComments: async (videoId: string, page = 1, limit = 20) => {
    const response = await api.get(`/videos/${videoId}/comments?page=${page}&limit=${limit}`);
    return response.data;
  },

  addComment: async (videoId: string, content: string, parentId?: string) => {
    const response = await api.post(`/videos/${videoId}/comments`, { content, parentId });
    return response.data;
  },

  getCreatorVideos: async (creatorId: string, page = 1, limit = 20) => {
    const response = await api.get(`/videos/creator/${creatorId}?page=${page}&limit=${limit}`);
    return response.data;
  },
};

// Users API
export const usersAPI = {
  getCreators: async (page = 1, limit = 20) => {
    const response = await api.get(`/users/creators?page=${page}&limit=${limit}`);
    return response.data;
  },

  getProfile: async (userId: string) => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },

  updateProfile: async (userId: string, data: {
    displayName?: string;
    bio?: string;
    avatar?: string;
    username?: string;
    dateOfBirth?: string;
    gender?: string;
    country?: string;
    phone?: string;
    language?: string;
  }) => {
    const response = await api.put(`/users/${userId}`, data);
    return response.data;
  },

  getProfileCompletion: async () => {
    const response = await api.get('/users/me/profile-completion');
    return response.data;
  },

  getBadges: async (userId: string) => {
    const response = await api.get(`/users/${userId}/badges`);
    return response.data;
  },

  follow: async (userId: string) => {
    const response = await api.post(`/users/${userId}/follow`);
    return response.data;
  },

  unfollow: async (userId: string) => {
    const response = await api.delete(`/users/${userId}/follow`);
    return response.data;
  },

  getFollowers: async (userId: string, page = 1, limit = 20) => {
    const response = await api.get(`/users/${userId}/followers?page=${page}&limit=${limit}`);
    return response.data;
  },

  getFollowing: async (userId: string, page = 1, limit = 20) => {
    const response = await api.get(`/users/${userId}/following?page=${page}&limit=${limit}`);
    return response.data;
  },

  isFollowing: async (userId: string) => {
    const response = await api.get(`/users/${userId}/is-following`);
    return response.data;
  },
};

// Wallet API
export const walletAPI = {
  getBalance: async () => {
    const response = await api.get('/wallet');
    return response.data;
  },

  getTransactions: async (page = 1, limit = 20, type?: string) => {
    const url = type
      ? `/wallet/transactions?page=${page}&limit=${limit}&type=${type}`
      : `/wallet/transactions?page=${page}&limit=${limit}`;
    const response = await api.get(url);
    return response.data;
  },

  topUp: async (amount: number) => {
    const response = await api.post('/wallet/topup', { amount });
    return response.data;
  },

  getRewards: async () => {
    const response = await api.get('/wallet/rewards');
    return response.data;
  },

  transferRewards: async (amount: number) => {
    const response = await api.post('/wallet/transfer-rewards', { amount });
    return response.data;
  },
};

// Clubs API
export const clubsAPI = {
  getClubs: async (page = 1, limit = 20, search?: string, official?: boolean) => {
    let url = `/clubs?page=${page}&limit=${limit}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (official) url += `&official=true`;
    const response = await api.get(url);
    return response.data;
  },

  getClub: async (clubId: string) => {
    const response = await api.get(`/clubs/${clubId}`);
    return response.data;
  },

  createClub: async (data: { name: string; description?: string; avatar?: string; banner?: string; isPrivate?: boolean }) => {
    const response = await api.post('/clubs', data);
    return response.data;
  },

  updateClub: async (clubId: string, data: { name?: string; description?: string; avatar?: string; banner?: string }) => {
    const response = await api.put(`/clubs/${clubId}`, data);
    return response.data;
  },

  joinClub: async (clubId: string) => {
    const response = await api.post(`/clubs/${clubId}/join`);
    return response.data;
  },

  leaveClub: async (clubId: string) => {
    const response = await api.delete(`/clubs/${clubId}/leave`);
    return response.data;
  },

  getMembers: async (clubId: string, page = 1, limit = 20) => {
    const response = await api.get(`/clubs/${clubId}/members?page=${page}&limit=${limit}`);
    return response.data;
  },

  isMember: async (clubId: string) => {
    const response = await api.get(`/clubs/${clubId}/is-member`);
    return response.data;
  },

  requestVerification: async (clubId: string) => {
    const response = await api.post(`/clubs/${clubId}/request-verification`);
    return response.data;
  },

  getMyMemberships: async () => {
    const response = await api.get('/clubs/my/memberships');
    return response.data;
  },
};

// Challenges API
export const challengesAPI = {
  getChallenges: async (page = 1, limit = 20, status?: string, clubId?: string) => {
    let url = `/challenges?page=${page}&limit=${limit}`;
    if (status) url += `&status=${status}`;
    if (clubId) url += `&clubId=${clubId}`;
    const response = await api.get(url);
    return response.data;
  },

  getChallenge: async (challengeId: string) => {
    const response = await api.get(`/challenges/${challengeId}`);
    return response.data;
  },

  getEntries: async (challengeId: string, page = 1, limit = 20, sort = 'votes') => {
    const response = await api.get(`/challenges/${challengeId}/entries?page=${page}&limit=${limit}&sort=${sort}`);
    return response.data;
  },

  submitEntry: async (challengeId: string, data: { title?: string; content: string; mediaUrl?: string; mediaType?: string }) => {
    const response = await api.post(`/challenges/${challengeId}/entries`, data);
    return response.data;
  },

  voteForEntry: async (challengeId: string, entryId: string) => {
    const response = await api.post(`/challenges/${challengeId}/entries/${entryId}/vote`);
    return response.data;
  },

  removeVote: async (challengeId: string, entryId: string) => {
    const response = await api.delete(`/challenges/${challengeId}/entries/${entryId}/vote`);
    return response.data;
  },

  getMyVotes: async (challengeId: string) => {
    const response = await api.get(`/challenges/${challengeId}/votes/my`);
    return response.data;
  },
};

// Series API
export const seriesAPI = {
  getSeries: async (page = 1, limit = 20, category?: string) => {
    let url = `/series?limit=${limit}&offset=${(page - 1) * limit}`;
    if (category) url += `&category=${encodeURIComponent(category)}`;
    const response = await api.get(url);
    return response.data;
  },

  getSeriesById: async (seriesId: string) => {
    const response = await api.get(`/series/${seriesId}`);
    return response.data;
  },

  getCreatorSeries: async (creatorId: string, page = 1, limit = 20) => {
    const response = await api.get(`/series?creatorId=${creatorId}&limit=${limit}&offset=${(page - 1) * limit}`);
    return response.data;
  },
};

// Notifications API
export const notificationsAPI = {
  getNotifications: async (page = 1, limit = 20, unreadOnly = false) => {
    const response = await api.get(`/notifications?page=${page}&limit=${limit}&unreadOnly=${unreadOnly}`);
    return response.data;
  },

  getUnreadCount: async () => {
    const response = await api.get('/notifications/unread-count');
    return response.data;
  },

  markAsRead: async (id: string) => {
    const response = await api.put(`/notifications/${id}/read`);
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await api.put('/notifications/read-all');
    return response.data;
  },

  deleteNotification: async (id: string) => {
    const response = await api.delete(`/notifications/${id}`);
    return response.data;
  },

  registerPushToken: async (token: string, platform: string, deviceId?: string) => {
    const response = await api.post('/notifications/push-token', { token, platform, deviceId });
    return response.data;
  },

  deactivatePushToken: async (token: string) => {
    const response = await api.delete('/notifications/push-token', { data: { token } });
    return response.data;
  },

  getSettings: async () => {
    const response = await api.get('/notifications/settings');
    return response.data;
  },

  updateSettings: async (settings: Record<string, boolean | string>) => {
    const response = await api.put('/notifications/settings', settings);
    return response.data;
  },
};

export default api;