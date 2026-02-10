/**
 * Enterprise SaaS Application Type Definitions
 */

import { Timestamp } from 'firebase/firestore';

// ============================================
// USER & AUTHENTICATION TYPES
// ============================================

export type UserRole = 'admin' | 'manager' | 'employee' | 'viewer';

export interface User {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  department?: string;
  avatar?: string;
  phone?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastLogin?: Timestamp;
  isActive: boolean;
}

// ============================================
// DASHBOARD TYPES
// ============================================

export interface DashboardMetric {
  id: string;
  title: string;
  value: number | string;
  change: number;
  trend: 'up' | 'down' | 'neutral';
  icon: string;
  color: string;
}

export interface ChartData {
  name: string;
  value: number;
  [key: string]: any;
}

export interface Activity {
  id: string;
  type: 'user' | 'system' | 'crm' | 'employee';
  action: string;
  description: string;
  user: string;
  timestamp: Timestamp;
  metadata?: Record<string, any>;
}

// ============================================
// CRM TYPES
// ============================================

export type ContactStatus = 'active' | 'inactive' | 'archived';
export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost';
export type DealStage = 'prospecting' | 'qualification' | 'proposal' | 'negotiation' | 'closed-won' | 'closed-lost';
export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  position?: string;
  status: ContactStatus;
  tags: string[];
  notes?: string;
  avatar?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
  lastContactedAt?: Timestamp;
}

export interface Lead {
  id: string;
  contactId: string;
  title: string;
  description: string;
  status: LeadStatus;
  source: string;
  value: number;
  probability: number;
  expectedCloseDate?: Timestamp;
  assignedTo: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
}

export interface Deal {
  id: string;
  leadId?: string;
  contactId: string;
  title: string;
  description: string;
  stage: DealStage;
  value: number;
  probability: number;
  expectedCloseDate?: Timestamp;
  actualCloseDate?: Timestamp;
  assignedTo: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  type: 'call' | 'email' | 'meeting' | 'follow-up' | 'other';
  priority: Priority;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  dueDate: Timestamp;
  assignedTo: string;
  relatedTo?: {
    type: 'contact' | 'lead' | 'deal';
    id: string;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
  completedAt?: Timestamp;
}

export interface Note {
  id: string;
  content: string;
  relatedTo: {
    type: 'contact' | 'lead' | 'deal' | 'employee';
    id: string;
  };
  createdAt: Timestamp;
  createdBy: string;
  isPinned: boolean;
}

// ============================================
// EMPLOYEE MANAGEMENT TYPES
// ============================================

export type EmploymentStatus = 'active' | 'on-leave' | 'terminated' | 'resigned';
export type EmploymentType = 'full-time' | 'part-time' | 'contract' | 'intern';
export type LeaveType = 'vacation' | 'sick' | 'personal' | 'unpaid';
export type LeaveStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface Employee {
  id: string;
  userId: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: string;
  department: string;
  position: string;
  employmentType: EmploymentType;
  employmentStatus: EmploymentStatus;
  hireDate: Timestamp;
  salary?: number;
  manager?: string;
  skills: string[];
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Department {
  id: string;
  name: string;
  description?: string;
  managerId?: string;
  employeeCount: number;
  budget?: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  type: LeaveType;
  startDate: Timestamp;
  endDate: Timestamp;
  days: number;
  reason: string;
  status: LeaveStatus;
  approvedBy?: string;
  approvedAt?: Timestamp;
  rejectionReason?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Attendance {
  id: string;
  employeeId: string;
  date: Timestamp;
  checkIn?: Timestamp;
  checkOut?: Timestamp;
  status: 'present' | 'absent' | 'late' | 'half-day' | 'on-leave';
  notes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface PerformanceReview {
  id: string;
  employeeId: string;
  reviewerId: string;
  period: string;
  rating: number;
  strengths: string[];
  areasForImprovement: string[];
  goals: string[];
  comments: string;
  status: 'draft' | 'submitted' | 'completed';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Document {
  id: string;
  employeeId: string;
  title: string;
  type: 'contract' | 'certificate' | 'id' | 'other';
  fileUrl: string;
  fileName: string;
  fileSize: number;
  uploadedBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
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
  tags: string[];
  notes?: string;
}

export interface LeadFormData {
  contactId: string;
  title: string;
  description: string;
  status: LeadStatus;
  source: string;
  value: number;
  probability: number;
  expectedCloseDate?: Date;
  assignedTo: string;
}

export interface EmployeeFormData {
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  department: string;
  position: string;
  employmentType: EmploymentType;
  hireDate: Date;
  salary?: number;
  manager?: string;
  skills: string[];
}

// ============================================
// FILTER & SEARCH TYPES
// ============================================

export interface FilterOptions {
  status?: string[];
  department?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationOptions {
  page: number;
  pageSize: number;
  total: number;
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ListResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
