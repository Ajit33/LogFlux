export type LogLevel = "error" | "warn" | "info" | "debug" | "trace" | "fatal";

export interface LogEntry {
  id?:        string;
  level:      LogLevel;
  message:    string;
  resourceId: string;
  timestamp:  string;
  traceId?:   string;
  spanId?:    string;
  commit?:    string;
  metadata?:  { parentResourceId?: string; [key: string]: unknown };
}

export interface SearchParams {
  q?:                string;
  level?:            string;
  resourceId?:       string;
  traceId?:          string;
  spanId?:           string;
  commit?:           string;
  parentResourceId?: string;
  timestampFrom?:    string;
  timestampTo?:      string;
  regex?:            boolean;
  page?:             number;
  limit?:            number;
}

export interface SearchResponse {
  total: number;
  page:  number;
  limit: number;
  pages: number;
  logs:  LogEntry[];
}

export type UserRole = "admin" | "viewer";

export interface User {
  id:       string;
  username: string;
  role:     UserRole;
}

export interface AuthState {
  user:  User | null;
  token: string | null;
}