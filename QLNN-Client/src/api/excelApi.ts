import { apiClient } from './apiClient';

export const excelApi = {
  async importExcel(file: File, villageId?: string): Promise<{
    status: string;
    totalRowsParsed: number;
    createdCount: number;
    updatedCount: number;
  }> {
    const formData = new FormData();
    formData.append('file', file);
    if (villageId) {
      formData.append('villageId', villageId);
    }

    const res = await apiClient.post('/excel/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  async exportExcel(villageId?: string): Promise<Blob> {
    const res = await apiClient.get('/excel/export', {
      params: villageId ? { villageId } : undefined,
      responseType: 'blob',
    });
    return res.data;
  },
};
