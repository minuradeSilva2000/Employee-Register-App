/**
 * Core Type Definitions for Employee Management System
 * Centralized type system for the entire application
 */

// ==================== USER & AUTH TYPES ====================

export enum UserRole {
  ADMIN = 'Admin',
  HR = 'HR',
  VIEWER = 'Viewer'
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  profilePicture?: string;
  authProvider?: 'local' | 'google';
  permissions?: string[];
  isActive?: boolean;
  lastLogin?: Date;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  data?: {
    accessToken: string;
    refreshToken: string;
    user: User;
  };
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; message?: string }>;
  loginWithGoogle: (googleData: any) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}

// ==================== EMPLOYEE TYPES ====================

export enum EmployeeStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
  PROBATION = 'Probation',
  ON_LEAVE = 'On Leave',
  TERMINATED = 'Terminated'
}

export interface Employee {
  _id: string;
  fullName: string;
  NIC: string;
  email: string;
  phone: string;
  address: string;
  jobTitle: string | JobTitle;
  department: string | Department;
  salary: number;
  dateJoined: Date | string;
  status: EmployeeStatus;
  createdBy?: string;
  updatedBy?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface EmployeeFormData {
  fullName: string;
  NIC: string;
  email: string;
  phone: string;
  address: string;
  jobTitle: string;
  department: string;
  salary: string | number;
  dateJoined: string;
  status: EmployeeStatus | '';
}

// ==================== DEPARTMENT TYPES ====================

export interface Department {
  _id: string;
  name: string;
  description: string;
  employeeCount?: number;
  createdBy?: string;
  updatedBy?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface DepartmentFormData {
  name: string;
  description: string;
}

// ==================== JOB TITLE TYPES ====================

export interface JobTitle {
  _id: string;
  title: string;
  description: string;
  employeeCount?: number;
  createdBy?: string;
  updatedBy?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface JobTitleFormData {
  title: string;
  description: string;
}

// ==================== ATTENDANCE TYPES ====================

export interface Attendance {
  _id: string;
  employee: string | Employee;
  date: Date | string;
  checkIn: Date | string;
  checkOut?: Date | string;
  status: 'Present' | 'Absent' | 'Late' | 'Half Day';
  notes?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

// ==================== NOTIFICATION TYPES ====================

export interface Notification {
  _id: string;
  userId?: string;
  targetRole?: UserRole;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  entityType?: 'Employee' | 'Department' | 'JobTitle' | 'Attendance' | 'User' | 'System';
  entityId?: string;
  actionUrl?: string;
  isRead: boolean;
  readAt?: Date | string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: Date | string;
  expiresAt?: Date | string;
}

export interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  fetchNotifications: () => Promise<void>;
}

// ==================== API RESPONSE TYPES ====================

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// ==================== FORM VALIDATION TYPES ====================

export interface FormErrors {
  [key: string]: string | undefined;
}

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean;
  message: string;
}

// ==================== DASHBOARD TYPES ====================

export interface DashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  departments: number;
  pendingRequests: number;
}

// ==================== QUICK ACTION TYPES ====================

export enum QuickActionType {
  ADD_EMPLOYEE = 'ADD_EMPLOYEE',
  VIEW_EMPLOYEES = 'VIEW_EMPLOYEES',
  UPDATE_EMPLOYEE = 'UPDATE_EMPLOYEE',
  DELETE_EMPLOYEE = 'DELETE_EMPLOYEE',
  ASSIGN_DEPARTMENT = 'ASSIGN_DEPARTMENT',
  SEARCH_EMPLOYEE = 'SEARCH_EMPLOYEE'
}

export interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  route?: string;
  roleAccess?: UserRole[];
}

// ==================== SOCKET TYPES ====================

export interface SocketContextType {
  socket: any | null;
  isConnected: boolean;
  emit: (event: string, data: any) => void;
}

// ==================== UTILITY TYPES ====================

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type AsyncFunction<T = void> = () => Promise<T>;
