// ============================================
// EMPLOYEE VALIDATION SCHEMAS
// Zod schemas for employee forms
// ============================================

import { z } from 'zod'

export const employeeSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name is too long'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address'),
  phone: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .regex(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/, 'Invalid phone number format'),
  department: z
    .string()
    .min(2, 'Department must be at least 2 characters')
    .max(50, 'Department name is too long'),
  position: z
    .string()
    .min(2, 'Position must be at least 2 characters')
    .max(100, 'Position is too long'),
  status: z.enum(['active', 'on-leave', 'inactive'], {
    errorMap: () => ({ message: 'Please select a valid status' }),
  }),
  joinDate: z.string().optional(),
  salary: z.number().min(0, 'Salary must be positive').optional(),
})

export const employeeFilterSchema = z.object({
  searchTerm: z.string().optional(),
  department: z.string().optional(),
  status: z.enum(['all', 'active', 'on-leave', 'inactive']).optional(),
  sortBy: z.enum(['name', 'email', 'department', 'joinDate']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
})

export type EmployeeFormData = z.infer<typeof employeeSchema>
export type EmployeeFilterData = z.infer<typeof employeeFilterSchema>
