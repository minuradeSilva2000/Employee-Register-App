// ============================================
// CRM VALIDATION SCHEMAS
// Zod schemas for CRM forms
// ============================================

import { z } from 'zod'

export const contactSchema = z.object({
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
  company: z
    .string()
    .min(2, 'Company name must be at least 2 characters')
    .max(100, 'Company name is too long'),
  status: z.enum(['lead', 'customer', 'prospect'], {
    errorMap: () => ({ message: 'Please select a valid status' }),
  }),
  notes: z.string().max(500, 'Notes are too long').optional(),
})

export const contactFilterSchema = z.object({
  searchTerm: z.string().optional(),
  status: z.enum(['all', 'lead', 'customer', 'prospect']).optional(),
  sortBy: z.enum(['name', 'email', 'company', 'createdAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
})

export type ContactFormData = z.infer<typeof contactSchema>
export type ContactFilterData = z.infer<typeof contactFilterSchema>
