export type ApiErrorResponse = {
  message: string;
  statusCode?: number;
  timestamp?: string;
  path?: string;
};

export type PageResponse<T> = {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};
