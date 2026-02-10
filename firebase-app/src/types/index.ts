/**
 * TypeScript Type Definitions
 * 
 * All interfaces and types for the Firebase Employee Management System
 */

import { User as FirebaseUser } from 'firebase/auth';
import { Timestamp } from 'firebase/firestore';

// ==================== USER & AUTH TYPES ====================

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: UserRole;
  createdAt: Date;
  lastLogin: Date;
}

export enum UserRole {
  ADMIN = 'admin',
  HR = 'hr',
  VIEWER = 'viewer'
}

export interface AuthState {
  user: FirebaseUser | null;
  loading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResult {
  success: boolean;
  user?: FirebaseUser;
  error?: string;
}

// ==================== EMPLOYEE TYPES ====================

export interface Employee {
  id?: string;
  fullName: string;
  email: string;
  phone: string;
  department: string;
  jobTitle: string;
  salary: number;
  dateJoined: Date | Timestamp;
  status: EmployeeStatus;
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
  createdBy: string; // User UID
}

export enum EmployeeStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
  ON_LEAVE = 'On Leave',
  TERMINATED = 'Terminated'
}

export interface EmployeeFormData {
  fullName: string;
  email: string;
  phone: string;
  department: string;
  jobTitle: string;
  salary: string | number;
  dateJoined: string;
  status: EmployeeStatus | '';
}

// ==================== DEPARTMENT TYPES ====================

export interface Department {
  id?: string;
  name: string;
  description: string;
  headOfDepartment: string;
  employeeCount: number;
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
}

// ==================== REPORT TYPES ====================

export interface Report {
  id?: string;
  title: string;
  type: ReportType;
  data: any[];
  generatedAt: Date | Timestamp;
  generatedBy: string; // User UID
}

export enum ReportType {
  EMPLOYEE_LIST = 'Employee List',
  DEPARTMENT_SUMMARY = 'Department Summary',
  SALARY_ANALYSIS = 'Salary Analysis',
  ATTENDANCE = 'Attendance Report'
}

export interface ReportExportOptions {
  format: 'csv' | 'pdf';
  filename: string;
  data: any[];
  columns: string[];
}

// ==================== QUICK ACTION TYPES ====================

export interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  action: QuickActionType;
}

export enum QuickActionType {
  ADD_DATA = 'add',
  VIEW_DATA = 'view',
  UPDATE_DATA = 'update',
  DELETE_DATA = 'delete',
  GENERATE_REPORT = 'report'
}

// ==================== FORM VALIDATION TYPES ====================

export interface FormErrors {
  [key: string]: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: FormErrors;
}

// ==================== FIRESTORE QUERY TYPES ====================

export interface QueryOptions {
  orderBy?: string;
  order?: 'asc' | 'desc';
  limit?: number;
  where?: {
    field: string;
    operator: '==' | '!=' | '<' | '<=' | '>' | '>=' | 'in' | 'array-contains';
    value: any;
  }[];
}

// ==================== API RESPONSE TYPES ====================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ==================== UTILITY TYPES ====================

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type AsyncFunction<T = void> = () => Promise<T>;
