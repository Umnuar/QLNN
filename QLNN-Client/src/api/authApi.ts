import axios from 'axios';
import { AUTH_BASE_URL, apiClient } from './apiClient';
import { User } from '../types';

export const authApi = {
  async login(credentials: {
    username: string;
    password: string;
  }): Promise<{ accessToken: string; refreshToken: string; user: User }> {
    const res = await axios.post(`${AUTH_BASE_URL}/login`, credentials);
    // QLCS Backend returns { data: { accessToken, refreshToken, user } }
    return res.data.data || res.data;
  },

  async getMe(accessToken: string): Promise<User> {
    const res = await axios.get(`${AUTH_BASE_URL}/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return res.data.data || res.data.user || res.data;
  },

  async logout(refreshToken: string): Promise<void> {
    try {
      await axios.post(`${AUTH_BASE_URL}/logout`, { refreshToken });
    } catch {
      // Ignore
    }
  },

  async getUsers(): Promise<{ status: string; data: User[] }> {
    const res = await apiClient.get('/users');
    return res.data;
  },
};
