export type NotificationType = 'System' | 'Expiration' | 'RecipeInteraction';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  relatedEntityId: string | null;
  isRead: boolean;
  createdDate: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  count: number;
  page: number;
  size: number;
  pages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

