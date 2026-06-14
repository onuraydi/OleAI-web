import { apiInstance as api } from '@/shared/api/base';
import type { PaginatedAdminLogsResponse, GetDatabaseLogsParams } from '../types';

export const adminLogApi = {
  getDatabaseLogs: async (params: GetDatabaseLogsParams): Promise<PaginatedAdminLogsResponse> => {
    // Backend defaults: page=0, size=20, so we send page - 1 if we use 1-based index in UI.
    // Assuming UI uses 1-based index.
    const queryPage = params.page ? params.page - 1 : 0;
    const queryParams = new URLSearchParams({
      page: queryPage.toString(),
      size: (params.size || 20).toString(),
    });

    if (params.level && params.level !== 'All') {
      queryParams.append('level', params.level);
    }
    if (params.keyword) {
      queryParams.append('keyword', params.keyword);
    }
    if (params.correlationId) {
      queryParams.append('correlationId', params.correlationId);
    }

    const { data } = await api.get<PaginatedAdminLogsResponse>(`/admin/logs/db?${queryParams.toString()}`);
    return data;
  },

  getLogFiles: async (): Promise<string[]> => {
    const { data } = await api.get<string[]>('/admin/logs/files');
    return data;
  },
  
  downloadLogFile: async (fileName: string): Promise<Blob> => {
    const { data } = await api.get<Blob>(`/admin/logs/files/${fileName}`, {
      responseType: 'blob'
    });
    return data;
  }
};
