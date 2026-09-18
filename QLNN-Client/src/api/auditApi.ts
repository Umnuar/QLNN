import { apiClient } from './apiClient';
import { AuditLog } from '../types';

export type { AuditLog };

export const auditApi = {
  getLogs: async (villageId?: string, limit: number = 50, offset: number = 0) => {
    const url = villageId && villageId !== 'all'
      ? `/audit/${villageId}?limit=${limit}&offset=${offset}`
      : `/audit?limit=${limit}&offset=${offset}`;
    const res = await apiClient.get(url);
    
    if (res.data && Array.isArray(res.data.data)) {
      res.data.data = res.data.data.map((log: AuditLog) => {
        if (typeof log.details === 'string') {
          try {
            log.details = JSON.parse(log.details);
          } catch (e) {
            // keep string if not parseable
          }
        }
        return log;
      });
    }
    
    return res.data;
  },
  getPage: async (params?: { villageId?: string; limit?: number; offset?: number; page?: number }) => {
    const limit = params?.limit || 50;
    const offset = params?.offset !== undefined ? params?.offset : (params?.page ? (params.page - 1) * limit : 0);
    const villageId = params?.villageId;
    return auditApi.getLogs(villageId, limit, offset);
  }
};
