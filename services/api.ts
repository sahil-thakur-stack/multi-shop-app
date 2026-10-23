import { Platform } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Router from 'expo-router';

let BASE_URL = 'https://localhost:7179';
if (Platform.OS === 'android') {
  BASE_URL = 'http://10.0.2.2:7179';
} else if (Platform.OS === 'ios') {
  BASE_URL = 'https://localhost:7179';
}

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

api.interceptors.request.use(
  async (config) => {
    // Only set auth token if Authorization header not already set
    if (!config.headers.Authorization) {
      const token = await AsyncStorage.getItem('auth-token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 401 Unauthorized - try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = await AsyncStorage.getItem('refresh-token');
        if (refreshToken) {
          const response = await axios.post(`${BASE_URL}/api/auth/refresh-token`, {
            refreshToken,
          });
          const { accessToken } = response.data;
          await AsyncStorage.setItem('auth-token', accessToken);
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (err) {
        // Token refresh failed - logout user
        await handleLogout();
      }
    }

    // If still 401 after retry, logout
    if (error.response?.status === 401) {
      await handleLogout();
    }

    return Promise.reject(error);
  }
);

async function handleLogout() {
  try {
    // Clear all auth data
    await AsyncStorage.multiRemove([
      'auth-token',
      'refresh-token',
      'auth-user',
      'registration-token',
    ]);

    // Navigate to login
    Router.router.replace('/auth/login');
  } catch (error) {
    console.error('Logout error:', error);
  }
}

export default api;
