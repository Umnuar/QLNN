import { apiClient } from './apiClient';
import { Village } from '../types';

export const villageApi = {
  async getAll(): Promise<Village[]> {
    const res = await apiClient.get('/villages');
    return res.data.data;
  },
};
