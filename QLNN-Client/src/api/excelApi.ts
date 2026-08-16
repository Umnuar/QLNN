import { apiClient } from './apiClient';

export interface ExcelPreviewItem {
  stt: number;
  full_name: string;
  action: 'create' | 'update';
  existingId: string | null;
  cropCount: number;
  livestockCount: number;
  aquaCount: number;
  notes?: string;
}

export interface ExcelPreviewResponse {
  status: string;
  villageName: string;
  totalRowsParsed: number;
  createCount: number;
  updateCount: number;
  previewList: ExcelPreviewItem[];
}

export const excelApi = {
  async previewExcel(file: File, villageId?: string): Promise<ExcelPreviewResponse> {
    const formData = new FormData();
    formData.append('file', file);
    if (villageId) {
      formData.append('villageId', villageId);
    }

    const res = await apiClient.post('/excel/preview', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  async importExcel(file: File, villageId?: string): Promise<{
    status: string;
    message: string;
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
