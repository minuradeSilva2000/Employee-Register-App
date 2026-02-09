/**
 * Form Validation Utilities
 * Comprehensive validation for employee forms
 */

import { EmployeeFormData, FormErrors } from '../types/employee.types';
import { isValidEmail, isValidPhone } from './aiHelper';

/**
 * Validate employee form data
 */
export const validateEmployeeForm = (formData: EmployeeFormData): FormErrors => {
  const errors: FormErrors = {};
  
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
  
  // Role validation
  if (!formData.role) {
    errors.role = 'Role is required';
  }
  
  // Status validation
  if (!formData.status) {
    errors.status = 'Status is required';
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
  
  return errors;
};

/**
 * Check if form has any errors
 */
export const hasFormErrors = (errors: FormErrors): boolean => {
  return Object.keys(errors).length > 0;
};

/**
 * Sanitize form input
 */
export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/\s+/g, ' ');
};
