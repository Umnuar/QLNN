import axios from 'axios';
import { secureStorage } from '../utils/secureStorage';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
export const AUTH_BASE_URL = import.meta.env.VITE_AUTH_URL || 'http://localhost:5000/api/auth';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Gắn Bearer Token
apiClient.interceptors.request.use(
  async (config) => {
    const token = await secureStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Tự động refresh token khi gặp 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = await secureStorage.getItem('refreshToken');
        if (refreshToken) {
          const res = await axios.post(`${AUTH_BASE_URL}/refresh`, { refreshToken });
          const newAccessToken = res.data.accessToken;
          await secureStorage.setItem('accessToken', newAccessToken);

          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshErr) {
        await secureStorage.clear();
        window.dispatchEvent(new CustomEvent('auth:expired'));
      }
    }
    return Promise.reject(error);
  }
);
