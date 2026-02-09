/**
 * Form Validation Utilities
 * Type-safe validation functions
 */

import { EmployeeFormData, EmployeeFormErrors } from '../models/Employee.model';

/**
 * Email validation regex
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Phone validation regex (flexible format)
 */
const PHONE_REGEX = /^[\d\s\-\+\(\)]+$/;

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}

/**
 * Validate phone format
 */
export function isValidPhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');
  return PHONE_REGEX.test(phone) && cleaned.length >= 10;
}

/**
 * Validate employee form data
 */
export function validateEmployeeForm(formData: EmployeeFormData): EmployeeFormErrors {
  const errors: EmployeeFormErrors = {};

  // Full Name validation
  if (!formData.fullName.trim()) {
    errors.fullName = 'Full name is required';
  } else if (formData.fullName.trim().length < 2) {
    errors.fullName = 'Full name must be at least 2 characters';
  } else if (formData.fullName.trim().length > 100) {
    errors.fullName = 'Full name must not exceed 100 characters';
  }

  // Email validation
  if (!formData.email.trim()) {
    errors.email = 'Email is required';
  } else if (!isValidEmail(formData.email)) {
    errors.email = 'Please enter a valid email address';
  }

  // Phone validation
  if (!formData.phone.trim()) {
    errors.phone = 'Phone number is required';
  } else if (!isValidPhone(formData.phone)) {
    errors.phone = 'Please enter a valid phone number (min 10 digits)';
  }

  // Department validation
  if (!formData.department) {
    errors.department = 'Department is required';
  }

  // Position validation
  if (!formData.position.trim()) {
    errors.position = 'Position is required';
  } else if (formData.position.trim().length < 2) {
    errors.position = 'Position must be at least 2 characters';
  }

  // Salary validation
  const salary = typeof formData.salary === 'string' ? parseFloat(formData.salary) : formData.salary;
  if (!formData.salary) {
    errors.salary = 'Salary is required';
  } else if (isNaN(salary) || salary <= 0) {
    errors.salary = 'Salary must be a positive number';
  } else if (salary < 10000) {
    errors.salary = 'Salary must be at least $10,000';
  } else if (salary > 10000000) {
    errors.salary = 'Salary must not exceed $10,000,000';
  }

  // Date Joined validation
  if (!formData.dateJoined) {
    errors.dateJoined = 'Date joined is required';
  } else {
    const joinDate = new Date(formData.dateJoined);
    const today = new Date();
    const maxFutureDate = new Date();
    maxFutureDate.setFullYear(today.getFullYear() + 1);

    if (isNaN(joinDate.getTime())) {
      errors.dateJoined = 'Please enter a valid date';
    } else if (joinDate > maxFutureDate) {
      errors.dateJoined = 'Date joined cannot be more than 1 year in the future';
    }
  }

  // Status validation
  if (!formData.status) {
    errors.status = 'Status is required';
  }

  return errors;
}

/**
 * Check if form has any errors
 */
export function hasFormErrors(errors: EmployeeFormErrors): boolean {
  return Object.keys(errors).length > 0;
}

/**
 * Sanitize string input
 */
export function sanitizeInput(input: string): string {
  return input.trim().replace(/\s+/g, ' ');
}

/**
 * Format currency
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * Format date
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
}

/**
 * Format date for input field
 */
export function formatDateForInput(date: Date): string {
  return date.toISOString().split('T')[0];
}
