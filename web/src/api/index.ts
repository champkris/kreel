import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API calls
export const authAPI = {
  register: async (userData: {
    email: string;
    password: string;
    username?: string;
    displayName?: string;
    userType?: string;
  }) => {
    const response = await api.post('/api/auth/register', userData);
    return response.data;
  },

  login: async (credentials: { email: string; password: string }) => {
    const response = await api.post('/api/auth/login', credentials);
    return response.data;
  },
};

export default api;
