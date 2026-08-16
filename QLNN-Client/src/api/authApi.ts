import axios from 'axios';
import { AUTH_BASE_URL } from './apiClient';
import { User } from '../types';

export const authApi = {
  async login(credentials: { username: string; password: string }): Promise<{ accessToken: string; refreshToken: string; user: User }> {
    const res = await axios.post(`${AUTH_BASE_URL}/login`, credentials);
    return res.data;
  },

  async getMe(accessToken: string): Promise<User> {
    const res = await axios.get(`${AUTH_BASE_URL}/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return res.data.user;
  },

  async logout(refreshToken: string): Promise<void> {
    try {
      await axios.post(`${AUTH_BASE_URL}/logout`, { refreshToken });
    } catch {
      // Ignore
    }
  },
};
