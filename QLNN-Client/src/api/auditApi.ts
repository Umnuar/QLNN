import { apiClient } from './apiClient';
import { AuditLog } from '../types';

export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'RESTORE' | 'IMPORT' | string;

export interface GetAuditLogsParams {
  villageId?: string;
  action?: string;
  limit?: number;
  offset?: number;
  page?: number;
  search?: string;
  userId?: string;
}

export interface AuditLogResponse {
  data: AuditLog[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export type { AuditLog };

export const auditApi = {
  getLogs: async (
    paramsOrVillageId?: string | GetAuditLogsParams,
    limitParam: number = 50,
    offsetParam: number = 0
  ) => {
    let villageId: string | undefined;
    let limit = limitParam;
    let offset = offsetParam;
    let action: string | undefined;
    let userId: string | undefined;
    let search: string | undefined;
    let page = 1;

    if (typeof paramsOrVillageId === 'object' && paramsOrVillageId !== null) {
      villageId = paramsOrVillageId.villageId;
      limit = paramsOrVillageId.limit || 50;
      page = paramsOrVillageId.page || 1;
      offset = paramsOrVillageId.offset !== undefined ? paramsOrVillageId.offset : (page - 1) * limit;
      action = paramsOrVillageId.action;
      userId = paramsOrVillageId.userId;
      search = paramsOrVillageId.search;
    } else if (typeof paramsOrVillageId === 'string') {
      villageId = paramsOrVillageId;
    }

    const queryParams = new URLSearchParams();
    queryParams.append('limit', String(limit));
    queryParams.append('offset', String(offset));
    if (action && action !== 'ALL') queryParams.append('action', action);
    if (userId) queryParams.append('username', userId);
    if (search && search.trim()) queryParams.append('search', search.trim());

    const url = villageId && villageId !== 'all' && villageId !== 'ALL'
      ? `/audit/${villageId}?${queryParams.toString()}`
      : `/audit?${queryParams.toString()}`;

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
    
    const total = res.data?.pagination?.total ?? (Array.isArray(res.data?.data) ? res.data.data.length : 0);
    const totalPages = res.data?.pagination?.totalPages ?? (Math.ceil(total / limit) || 1);

    return {
      data: res.data?.data || [],
      pagination: {
        total,
        page: res.data?.pagination?.page || page,
        limit,
        totalPages,
      }
    };
  },
  getPage: async (params?: GetAuditLogsParams) => {
    return auditApi.getLogs(params);
  }
};
