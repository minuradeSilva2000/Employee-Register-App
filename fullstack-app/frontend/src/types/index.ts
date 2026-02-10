/**
 * TypeScript Type Definitions
 */

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: User;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

export interface DataItem {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface DataFormData {
  title: string;
  description: string;
  category: string;
  status: 'active' | 'inactive' | '';
}

export interface ReportData {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  createdAt: string;
  createdBy: string;
}

export type QuickActionType = 'add' | 'view' | 'update' | 'delete' | 'report';

export interface QuickAction {
  id: QuickActionType;
  title: string;
  description: string;
  icon: string;
  color: string;
}
