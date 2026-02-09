/**
 * Employee Management System - Type Definitions
 * Comprehensive type system for the application
 */

// Enums for type safety
export enum EmployeeStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
  PROBATION = 'Probation',
  ON_LEAVE = 'On Leave',
  TERMINATED = 'Terminated'
}

export enum Department {
  ENGINEERING = 'Engineering',
  HUMAN_RESOURCES = 'Human Resources',
  SALES = 'Sales',
  MARKETING = 'Marketing',
  FINANCE = 'Finance',
  OPERATIONS = 'Operations',
  IT = 'IT',
  CUSTOMER_SUPPORT = 'Customer Support'
}

export enum Role {
  SOFTWARE_ENGINEER = 'Software Engineer',
  SENIOR_SOFTWARE_ENGINEER = 'Senior Software Engineer',
  TECH_LEAD = 'Tech Lead',
  HR_MANAGER = 'HR Manager',
  HR_SPECIALIST = 'HR Specialist',
  SALES_EXECUTIVE = 'Sales Executive',
  SALES_MANAGER = 'Sales Manager',
  MARKETING_MANAGER = 'Marketing Manager',
  MARKETING_SPECIALIST = 'Marketing Specialist',
  FINANCIAL_ANALYST = 'Financial Analyst',
  ACCOUNTANT = 'Accountant',
  OPERATIONS_MANAGER = 'Operations Manager',
  IT_SUPPORT = 'IT Support',
  CUSTOMER_SERVICE_REP = 'Customer Service Representative'
}

// Core Employee Interface
export interface Employee {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  department: Department;
  role: Role;
  status: EmployeeStatus;
  dateJoined: Date;
  avatar?: string;
  salary?: number;
  address?: string;
}

// Form Data Interface (for creating/updating employees)
export interface EmployeeFormData {
  fullName: string;
  email: string;
  phone: string;
  department: Department | '';
  role: Role | '';
  status: EmployeeStatus | '';
  dateJoined: string;
  avatar?: string;
  salary?: string;
  address?: string;
}

// Dashboard Statistics Interface
export interface DashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  departments: number;
  pendingRequests: number;
}

// Quick Action Interface
export interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  action: QuickActionType;
}

export enum QuickActionType {
  ADD_EMPLOYEE = 'ADD_EMPLOYEE',
  VIEW_EMPLOYEES = 'VIEW_EMPLOYEES',
  UPDATE_EMPLOYEE = 'UPDATE_EMPLOYEE',
  DELETE_EMPLOYEE = 'DELETE_EMPLOYEE',
  ASSIGN_DEPARTMENT = 'ASSIGN_DEPARTMENT',
  SEARCH_EMPLOYEE = 'SEARCH_EMPLOYEE'
}

// Form Validation Errors
export interface FormErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  department?: string;
  role?: string;
  status?: string;
  dateJoined?: string;
}

// AI Suggestion Interface
export interface AISuggestion {
  department?: Department;
  status?: EmployeeStatus;
  role?: Role;
  confidence: number;
  reason: string;
}

// Filter and Search Interface
export interface EmployeeFilters {
  department?: Department;
  status?: EmployeeStatus;
  role?: Role;
  searchTerm?: string;
}

// Modal State Interface
export interface ModalState {
  isOpen: boolean;
  type: QuickActionType | null;
  employee?: Employee;
}
