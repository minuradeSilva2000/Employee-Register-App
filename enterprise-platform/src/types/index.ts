/**
 * Core TypeScript Types and Interfaces
 * Enterprise Platform
 */

// ============================================
// USER & AUTHENTICATION
// ============================================

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  department?: string;
  position?: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type UserRole = 'admin' | 'manager' | 'employee' | 'user';

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role?: UserRole;
}

// ============================================
// CRM MODULE
// ============================================

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  position?: string;
  status: ContactStatus;
  source: ContactSource;
  tags: string[];
  notes?: string;
  assignedTo?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ContactStatus = 'lead' | 'prospect' | 'customer' | 'inactive';
export type ContactSource = 'website' | 'referral' | 'social' | 'email' | 'phone' | 'event' | 'other';

export interface Lead {
  id: string;
  contactId: string;
  title: string;
  value: number;
  probability: number;
  stage: LeadStage;
  status: LeadStatus;
  expectedCloseDate?: Date;
  assignedTo: string;
  notes?: string;
  activities: Activity[];
  createdAt: Date;
  updatedAt: Date;
}

export type LeadStage = 'qualification' | 'proposal' | 'negotiation' | 'closed-won' | 'closed-lost';
export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'proposal-sent' | 'negotiating' | 'closed';

export interface Deal {
  id: string;
  title: string;
  contactId: string;
  value: number;
  stage: DealStage;
  probability: number;
  expectedCloseDate: Date;
  actualCloseDate?: Date;
  assignedTo: string;
  products: DealProduct[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type DealStage = 'prospecting' | 'qualification' | 'proposal' | 'negotiation' | 'closed-won' | 'closed-lost';

export interface DealProduct {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
}

export interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  description?: string;
  relatedTo: {
    type: 'contact' | 'lead' | 'deal' | 'employee';
    id: string;
  };
  dueDate?: Date;
  completedDate?: Date;
  status: ActivityStatus;
  assignedTo: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ActivityType = 'call' | 'email' | 'meeting' | 'task' | 'note' | 'follow-up';
export type ActivityStatus = 'pending' | 'in-progress' | 'completed' | 'cancelled';

// ============================================
// EMPLOYEE MANAGEMENT MODULE
// ============================================

export interface Employee {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: Date;
  hireDate: Date;
  department: string;
  position: string;
  manager?: string;
  salary?: number;
  status: EmployeeStatus;
  address?: Address;
  emergencyContact?: EmergencyContact;
  documents: Document[];
  performance: PerformanceReview[];
  leaves: Leave[];
  createdAt: Date;
  updatedAt: Date;
}

export type EmployeeStatus = 'active' | 'on-leave' | 'terminated' | 'suspended';

export interface Department {
  id: string;
  name: string;
  description?: string;
  managerId?: string;
  employeeCount: number;
  budget?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
}

export interface Document {
  id: string;
  name: string;
  type: DocumentType;
  url: string;
  uploadedBy: string;
  uploadedAt: Date;
}

export type DocumentType = 'contract' | 'id' | 'certificate' | 'resume' | 'other';

export interface PerformanceReview {
  id: string;
  employeeId: string;
  reviewerId: string;
  period: string;
  rating: number;
  strengths: string[];
  improvements: string[];
  goals: string[];
  comments?: string;
  reviewDate: Date;
  createdAt: Date;
}

export interface Leave {
  id: string;
  employeeId: string;
  type: LeaveType;
  startDate: Date;
  endDate: Date;
  days: number;
  reason?: string;
  status: LeaveStatus;
  approvedBy?: string;
  approvedAt?: Date;
  createdAt: Date;
}

export type LeaveType = 'vacation' | 'sick' | 'personal' | 'maternity' | 'paternity' | 'unpaid';
export type LeaveStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

// ============================================
// ANALYTICS & REPORTING
// ============================================

export interface DashboardStats {
  totalContacts: number;
  totalLeads: number;
  totalDeals: number;
  totalRevenue: number;
  activeEmployees: number;
  pendingLeaves: number;
  revenueGrowth: number;
  conversionRate: number;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
  }[];
}

export interface ReportFilter {
  startDate?: Date;
  endDate?: Date;
  department?: string;
  status?: string;
  assignedTo?: string;
}

// ============================================
// COMMON TYPES
// ============================================

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface SelectOption {
  value: string;
  label: string;
}

export interface TableColumn<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
}

export interface FilterOption {
  field: string;
  operator: 'equals' | 'contains' | 'greaterThan' | 'lessThan' | 'between';
  value: any;
}

// ============================================
// FORM TYPES
// ============================================

export interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  position?: string;
  status: ContactStatus;
  source: ContactSource;
  tags?: string[];
  notes?: string;
}

export interface LeadFormData {
  contactId: string;
  title: string;
  value: number;
  probability: number;
  stage: LeadStage;
  expectedCloseDate?: Date;
  notes?: string;
}

export interface EmployeeFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: Date;
  hireDate: Date;
  department: string;
  position: string;
  manager?: string;
  salary?: number;
}

export interface DepartmentFormData {
  name: string;
  description?: string;
  managerId?: string;
  budget?: number;
}

// ============================================
// NOTIFICATION TYPES
// ============================================

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;
  createdAt: Date;
}

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

// ============================================
// SETTINGS TYPES
// ============================================

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
}

export interface SystemSettings {
  companyName: string;
  companyLogo?: string;
  currency: string;
  dateFormat: string;
  timeFormat: string;
  fiscalYearStart: string;
}
