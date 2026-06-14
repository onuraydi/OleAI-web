export interface SystemLogDto {
  id: number;
  message?: string;
  level?: string;
  timeStamp?: string;
  exception?: string;
  properties?: string;
  correlationId?: string;
}

export interface PaginatedAdminLogsResponse {
  pageNumber: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  items: SystemLogDto[];
}

export interface GetDatabaseLogsParams {
  page?: number;
  size?: number;
  level?: string;
  correlationId?: string;
  keyword?: string;
}
