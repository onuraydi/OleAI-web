export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  department: string;
  message: string;
  isRead: boolean;
  createdDate: string;
}

export interface PaginatedResponse<T> {
  index: number;
  size: number;
  count: number;
  pages: number;
  hasPrevious: boolean;
  hasNext: boolean;
  items: T[];
}

export interface ContactMessageApiResponse {
  id: string;
  message?: string;
}
