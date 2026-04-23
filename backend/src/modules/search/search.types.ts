export interface SearchQuery {
  q?: string;
  level?: string;
  message?: string;
  resourceId?: string;
  traceId?: string;
  spanId?: string;
  commit?: string;
  parentResourceId?: string;
  timestampFrom?: string;
  timestampTo?: string;
  regex?: string;
  page?: number;
  limit?: number;
}

export interface SearchResult {
  total: number;
  page: number;
  limit: number;
  logs: object[];
}