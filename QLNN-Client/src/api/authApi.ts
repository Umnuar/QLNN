import { apiClient } from './apiClient';
import { User } from '../types';

export const authApi = {
  async login(credentials: {
    username: string;
    password: string;
  }): Promise<{ accessToken: string; refreshToken: string; user: User }> {
    const res = await apiClient.post('/auth/login', credentials);
    return res.data;
  },

  async getMe(accessToken: string): Promise<User> {
    const res = await apiClient.get('/auth/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return res.data;
  },

  async getUsers() {
    return apiClient.get('/users');
  },

  async logout(_refreshToken: string): Promise<void> {
    // Chúng ta không quản lý logout ở backend, token tự hết hạn
  },
};
