import axios from 'axios';
import { Platform } from 'react-native';

// Test backend connectivity
export const testBackendConnection = async () => {
  const getAPIBaseURL = () => {
    if (__DEV__) {
      if (Platform.OS === 'ios') {
        return 'http://localhost:3001/api';
      } else if (Platform.OS === 'android') {
        return 'http://10.0.2.2:3001/api';
      } else {
        return 'http://192.168.1.43:3001/api';
      }
    } else {
      return 'https://your-production-api.com/api';
    }
  };

  const apiUrl = getAPIBaseURL();
  
  try {
    console.log(`🔗 Testing connection to: ${apiUrl}`);
    const response = await axios.get(`${apiUrl}/health`, { timeout: 5000 });
    console.log('✅ Backend connection successful:', response.status);
    return { success: true, url: apiUrl, status: response.status };
  } catch (error: any) {
    console.error('❌ Backend connection failed:', error.message);
    console.error('📍 Trying URL:', apiUrl);
    console.error('🔍 Platform:', Platform.OS);
    
    return { 
      success: false, 
      url: apiUrl, 
      error: error.message,
      platform: Platform.OS 
    };
  }
};

// Test specific auth endpoints
export const testAuthEndpoints = async () => {
  const results = {
    health: false,
    register: false,
    login: false
  };

  try {
    // Test health endpoint
    const healthResult = await testBackendConnection();
    results.health = healthResult.success;

    if (!results.health) {
      return results;
    }

    const apiUrl = healthResult.url;

    // Test register endpoint (with invalid data to check if endpoint exists)
    try {
      await axios.post(`${apiUrl}/auth/register`, {}, { timeout: 3000 });
    } catch (error: any) {
      // If we get a 400 error, the endpoint exists but data is invalid (good!)
      // If we get a 404 error, the endpoint doesn't exist (bad!)
      results.register = error.response?.status === 400 || error.response?.status === 422;
      console.log('📝 Register endpoint test:', error.response?.status, results.register ? '✅' : '❌');
    }

    // Test login endpoint (with invalid data to check if endpoint exists)
    try {
      await axios.post(`${apiUrl}/auth/login`, {}, { timeout: 3000 });
    } catch (error: any) {
      results.login = error.response?.status === 400 || error.response?.status === 401 || error.response?.status === 422;
      console.log('🔐 Login endpoint test:', error.response?.status, results.login ? '✅' : '❌');
    }

  } catch (error) {
    console.error('🚨 Auth endpoints test failed:', error);
  }

  return results;
};