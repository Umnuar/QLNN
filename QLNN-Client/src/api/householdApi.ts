import { apiClient } from './apiClient';
import { HouseholdFlat } from '../types';

export const householdApi = {
  async getPage(params: {
    page?: number;
    limit?: number;
    search?: string;
    villageId?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ data: HouseholdFlat[]; pagination: { total: number; page: number; limit: number; totalPages: number } }> {
    const res = await apiClient.get('/households', { params });
    return res.data;
  },

  async getById(id: string): Promise<HouseholdFlat> {
    const res = await apiClient.get(`/households/${id}`);
    return res.data.data;
  },

  async create(data: HouseholdFlat): Promise<HouseholdFlat> {
    const res = await apiClient.post('/households', data);
    return res.data.data;
  },

  async update(id: string, data: Partial<HouseholdFlat>): Promise<HouseholdFlat> {
    const res = await apiClient.put(`/households/${id}`, data);
    return res.data.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/households/${id}`);
  },

  async bulkDelete(ids: string[]): Promise<{ count: number }> {
    const res = await apiClient.delete('/households', { data: { ids } });
    return res.data;
  },

  async getDeleted(params: {
    page?: number;
    limit?: number;
    search?: string;
    villageId?: string;
  }): Promise<{ data: HouseholdFlat[]; pagination: { total: number; page: number; limit: number; totalPages: number } }> {
    const res = await apiClient.get('/households/deleted', { params });
    return res.data;
  },

  async restore(ids: string[]): Promise<void> {
    await apiClient.put('/households/restore', { ids });
  },

  async hardDelete(ids: string[]): Promise<void> {
    await apiClient.delete('/households/hard-delete', { data: { ids } });
  }
};
