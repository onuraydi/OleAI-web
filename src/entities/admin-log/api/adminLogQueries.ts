import { useQuery } from '@tanstack/react-query';
import { adminLogApi } from './adminLogApi';
import type { GetDatabaseLogsParams, PaginatedAdminLogsResponse } from '../types';

export const adminLogKeys = {
  all: ['adminLogs'] as const,
  lists: () => [...adminLogKeys.all, 'list'] as const,
  list: (params: GetDatabaseLogsParams) => [...adminLogKeys.lists(), params] as const,
  files: () => [...adminLogKeys.all, 'files'] as const,
};

export const useGetDatabaseLogs = (params: GetDatabaseLogsParams) => {
  return useQuery<PaginatedAdminLogsResponse, Error>({
    queryKey: adminLogKeys.list(params),
    queryFn: () => adminLogApi.getDatabaseLogs(params),
    placeholderData: (previousData) => previousData, // keep previous data while fetching next page
  });
};

export const useGetLogFiles = () => {
  return useQuery<string[], Error>({
    queryKey: adminLogKeys.files(),
    queryFn: () => adminLogApi.getLogFiles(),
  });
};
