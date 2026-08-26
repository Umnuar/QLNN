import { apiClient } from './apiClient';
import { User } from '../types';

export const authApi = {
  async login(credentials: {
    username: string;
    password: string;
  }): Promise<{ accessToken: string; refreshToken: string; user: User }> {
    const res = await apiClient.post('/auth/login', credentials);
    return res.data.data || res.data;
  },

  async getMe(accessToken?: string): Promise<User> {
    const config = accessToken ? { headers: { Authorization: `Bearer ${accessToken}` } } : {};
    const res = await apiClient.get('/auth/me', config);
    return res.data.data || res.data.user || res.data;
  },

  async getUsers(): Promise<User[]> {
    const res = await apiClient.get('/users');
    return res.data.data || res.data;
  },

  async logout(_refreshToken: string): Promise<void> {
    // Không cần gọi backend, token tự hủy
  },
};
