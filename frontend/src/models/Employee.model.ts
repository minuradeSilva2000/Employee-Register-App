/**
 * Employee Domain Model
 * Core business entity with complete type safety
 */

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

export interface Employee {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  department: Department;
  position: string;
  salary: number;
  dateJoined: Date;
  status: EmployeeStatus;
  address?: string;
  avatar?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface EmployeeFormData {
  fullName: string;
  email: string;
  phone: string;
  department: Department | '';
  position: string;
  salary: string | number;
  dateJoined: string;
  status: EmployeeStatus | '';
  address?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
}

export interface EmployeeFilters {
  department?: Department;
  status?: EmployeeStatus;
  searchTerm?: string;
}

export type EmployeeFormErrors = Partial<Record<keyof EmployeeFormData, string>>;
