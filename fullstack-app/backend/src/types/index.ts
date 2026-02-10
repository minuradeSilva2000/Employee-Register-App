/**
 * TypeScript Type Definitions
 */

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'user';
  createdAt: Date;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

export interface DataItem {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface CreateDataDTO {
  title: string;
  description: string;
  category: string;
  status: 'active' | 'inactive';
}

export interface UpdateDataDTO {
  title?: string;
  description?: string;
  category?: string;
  status?: 'active' | 'inactive';
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}
