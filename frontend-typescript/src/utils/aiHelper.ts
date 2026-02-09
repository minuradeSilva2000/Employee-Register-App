/**
 * AI-like Smart Helper Functions
 * Provides intelligent suggestions and auto-fill capabilities
 */

import { Department, Role, EmployeeStatus, AISuggestion } from '../types/employee.types';

/**
 * Role to Department mapping for intelligent suggestions
 */
const ROLE_DEPARTMENT_MAP: Record<string, Department> = {
  [Role.SOFTWARE_ENGINEER]: Department.ENGINEERING,
  [Role.SENIOR_SOFTWARE_ENGINEER]: Department.ENGINEERING,
  [Role.TECH_LEAD]: Department.ENGINEERING,
  [Role.HR_MANAGER]: Department.HUMAN_RESOURCES,
  [Role.HR_SPECIALIST]: Department.HUMAN_RESOURCES,
  [Role.SALES_EXECUTIVE]: Department.SALES,
  [Role.SALES_MANAGER]: Department.SALES,
  [Role.MARKETING_MANAGER]: Department.MARKETING,
  [Role.MARKETING_SPECIALIST]: Department.MARKETING,
  [Role.FINANCIAL_ANALYST]: Department.FINANCE,
  [Role.ACCOUNTANT]: Department.FINANCE,
  [Role.OPERATIONS_MANAGER]: Department.OPERATIONS,
  [Role.IT_SUPPORT]: Department.IT,
  [Role.CUSTOMER_SERVICE_REP]: Department.CUSTOMER_SUPPORT
};

/**
 * Suggests department based on role
 */
export const suggestDepartmentByRole = (role: Role): AISuggestion => {
  const department = ROLE_DEPARTMENT_MAP[role];
  
  if (department) {
    return {
      department,
      confidence: 0.95,
      reason: `Role "${role}" typically belongs to ${department} department`
    };
  }
  
  return {
    confidence: 0,
    reason: 'No department suggestion available for this role'
  };
};

/**
 * Suggests status based on date joined
 */
export const suggestStatusByDateJoined = (dateJoined: Date): AISuggestion => {
  const today = new Date();
  const monthsEmployed = (today.getTime() - dateJoined.getTime()) / (1000 * 60 * 60 * 24 * 30);
  
  if (monthsEmployed < 0) {
    return {
      status: EmployeeStatus.INACTIVE,
      confidence: 0.9,
      reason: 'Future join date - employee not yet started'
    };
  } else if (monthsEmployed < 6) {
    return {
      status: EmployeeStatus.PROBATION,
      confidence: 0.85,
      reason: 'Employee joined less than 6 months ago - typically on probation'
    };
  } else {
    return {
      status: EmployeeStatus.ACTIVE,
      confidence: 0.9,
      reason: 'Employee has been with company for more than 6 months'
    };
  }
};

/**
 * Comprehensive AI suggestion for employee data
 */
export const getAISuggestions = (
  role?: Role,
  dateJoined?: Date
): {
  department?: AISuggestion;
  status?: AISuggestion;
} => {
  const suggestions: {
    department?: AISuggestion;
    status?: AISuggestion;
  } = {};
  
  if (role) {
    suggestions.department = suggestDepartmentByRole(role);
  }
  
  if (dateJoined) {
    suggestions.status = suggestStatusByDateJoined(dateJoined);
  }
  
  return suggestions;
};

/**
 * Auto-fill form fields based on AI suggestions
 */
export const autoFillFormFields = (
  role?: Role,
  dateJoined?: Date
): {
  department?: Department;
  status?: EmployeeStatus;
} => {
  const result: {
    department?: Department;
    status?: EmployeeStatus;
  } = {};
  
  if (role) {
    const deptSuggestion = suggestDepartmentByRole(role);
    if (deptSuggestion.confidence > 0.8 && deptSuggestion.department) {
      result.department = deptSuggestion.department;
    }
  }
  
  if (dateJoined) {
    const statusSuggestion = suggestStatusByDateJoined(dateJoined);
    if (statusSuggestion.confidence > 0.8 && statusSuggestion.status) {
      result.status = statusSuggestion.status;
    }
  }
  
  return result;
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone format
 */
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^[\d\s\-\+\(\)]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
};

/**
 * Generate employee ID
 */
export const generateEmployeeId = (): string => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 7);
  return `EMP-${timestamp}-${random}`.toUpperCase();
};

/**
 * Format date for display
 */
export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
};

/**
 * Calculate tenure in months
 */
export const calculateTenure = (dateJoined: Date): number => {
  const today = new Date();
  const months = (today.getTime() - dateJoined.getTime()) / (1000 * 60 * 60 * 24 * 30);
  return Math.floor(months);
};

/**
 * Get status color for UI
 */
export const getStatusColor = (status: EmployeeStatus): string => {
  const colorMap: Record<EmployeeStatus, string> = {
    [EmployeeStatus.ACTIVE]: 'green',
    [EmployeeStatus.INACTIVE]: 'gray',
    [EmployeeStatus.PROBATION]: 'yellow',
    [EmployeeStatus.ON_LEAVE]: 'blue',
    [EmployeeStatus.TERMINATED]: 'red'
  };
  
  return colorMap[status] || 'gray';
};

/**
 * Get department color for UI
 */
export const getDepartmentColor = (department: Department): string => {
  const colorMap: Record<Department, string> = {
    [Department.ENGINEERING]: 'blue',
    [Department.HUMAN_RESOURCES]: 'purple',
    [Department.SALES]: 'green',
    [Department.MARKETING]: 'pink',
    [Department.FINANCE]: 'yellow',
    [Department.OPERATIONS]: 'orange',
    [Department.IT]: 'indigo',
    [Department.CUSTOMER_SUPPORT]: 'teal'
  };
  
  return colorMap[department] || 'gray';
};
