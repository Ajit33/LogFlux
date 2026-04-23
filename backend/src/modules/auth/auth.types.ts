export type UserRole = "admin" | "viewer";

export interface User {
  id:        string;
  username:  string;
  password:  string;
  role:      UserRole;
  createdBy: string | null;
  createdAt: string;
}

export interface JwtPayload {
  id:       string;
  username: string;
  role:     UserRole;
}