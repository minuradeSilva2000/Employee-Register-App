/**
 * TypeScript Type Definitions
 */

import { User as FirebaseUser } from 'firebase/auth';
import { Timestamp } from 'firebase/firestore';

// Auth Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthContextType {
  currentUser: FirebaseUser | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
}

// Data Types
export interface DataItem {
  id?: string;
  title: string;
  description: string;
  category: string;
  status: 'active' | 'inactive';
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
  createdBy: string;
}

export interface DataFormData {
  title: string;
  description: string;
  category: string;
  status: 'active' | 'inactive' | '';
}

// Report Types
export interface ReportData {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  createdAt: string;
}

export type QuickActionType = 'add' | 'view' | 'update' | 'delete' | 'report';

export interface QuickAction {
  id: QuickActionType;
  title: string;
  description: string;
  icon: string;
  color: string;
}
