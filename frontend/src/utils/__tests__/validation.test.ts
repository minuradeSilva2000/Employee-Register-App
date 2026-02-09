/**
 * Validation Utilities Tests
 * Unit tests for form validation functions
 */

import {
  isValidEmail,
  isValidPhone,
  validateEmployeeForm,
  hasFormErrors,
  sanitizeInput,
  formatCurrency,
  formatDate
} from '../validation';
import { EmployeeFormData, Department, EmployeeStatus } from '../../models/Employee.model';

describe('Validation Utilities', () => {
  describe('isValidEmail', () => {
    it('should validate correct email formats', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
      expect(isValidEmail('user+tag@example.com')).toBe(true);
    });

    it('should reject invalid email formats', () => {
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('invalid@')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('invalid@.com')).toBe(false);
    });
  });

  describe('isValidPhone', () => {
    it('should validate correct phone formats', () => {
      expect(isValidPhone('+1-555-0100')).toBe(true);
      expect(isValidPhone('555-0100')).toBe(true);
      expect(isValidPhone('(555) 010-0100')).toBe(true);
      expect(isValidPhone('5550100100')).toBe(true);
    });

    it('should reject invalid phone formats', () => {
      expect(isValidPhone('123')).toBe(false);
      expect(isValidPhone('abc')).toBe(false);
      expect(isValidPhone('')).toBe(false);
    });
  });

  describe('validateEmployeeForm', () => {
    const validFormData: EmployeeFormData = {
      fullName: 'John Doe',
      email: 'john@example.com',
      phone: '+1-555-0100',
      department: Department.ENGINEERING,
      position: 'Software Engineer',
      salary: 75000,
      dateJoined: '2024-01-01',
      status: EmployeeStatus.ACTIVE
    };

    it('should pass validation for valid form data', () => {
      const errors = validateEmployeeForm(validFormData);
      expect(Object.keys(errors).length).toBe(0);
    });

    it('should require full name', () => {
      const formData = { ...validFormData, fullName: '' };
      const errors = validateEmployeeForm(formData);
      expect(errors.fullName).toBeDefined();
    });

    it('should validate full name length', () => {
      const formData = { ...validFormData, fullName: 'A' };
      const errors = validateEmployeeForm(formData);
      expect(errors.fullName).toContain('at least 2 characters');
    });

    it('should require valid email', () => {
      const formData = { ...validFormData, email: 'invalid' };
      const errors = validateEmployeeForm(formData);
      expect(errors.email).toBeDefined();
    });

    it('should require valid phone', () => {
      const formData = { ...validFormData, phone: '123' };
      const errors = validateEmployeeForm(formData);
      expect(errors.phone).toBeDefined();
    });

    it('should require department', () => {
      const formData = { ...validFormData, department: '' };
      const errors = validateEmployeeForm(formData);
      expect(errors.department).toBeDefined();
    });

    it('should require position', () => {
      const formData = { ...validFormData, position: '' };
      const errors = validateEmployeeForm(formData);
      expect(errors.position).toBeDefined();
    });

    it('should validate salary range', () => {
      const formData1 = { ...validFormData, salary: 5000 };
      const errors1 = validateEmployeeForm(formData1);
      expect(errors1.salary).toContain('at least $10,000');

      const formData2 = { ...validFormData, salary: 20000000 };
      const errors2 = validateEmployeeForm(formData2);
      expect(errors2.salary).toContain('not exceed $10,000,000');
    });

    it('should require valid date', () => {
      const formData = { ...validFormData, dateJoined: '' };
      const errors = validateEmployeeForm(formData);
      expect(errors.dateJoined).toBeDefined();
    });

    it('should require status', () => {
      const formData = { ...validFormData, status: '' };
      const errors = validateEmployeeForm(formData);
      expect(errors.status).toBeDefined();
    });
  });

  describe('hasFormErrors', () => {
    it('should return true when errors exist', () => {
      const errors = { fullName: 'Required', email: 'Invalid' };
      expect(hasFormErrors(errors)).toBe(true);
    });

    it('should return false when no errors', () => {
      const errors = {};
      expect(hasFormErrors(errors)).toBe(false);
    });
  });

  describe('sanitizeInput', () => {
    it('should trim whitespace', () => {
      expect(sanitizeInput('  test  ')).toBe('test');
    });

    it('should replace multiple spaces with single space', () => {
      expect(sanitizeInput('test    multiple    spaces')).toBe('test multiple spaces');
    });
  });

  describe('formatCurrency', () => {
    it('should format currency correctly', () => {
      expect(formatCurrency(75000)).toBe('$75,000');
      expect(formatCurrency(1000000)).toBe('$1,000,000');
      expect(formatCurrency(50)).toBe('$50');
    });
  });

  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = new Date('2024-01-15');
      const formatted = formatDate(date);
      expect(formatted).toContain('2024');
      expect(formatted).toContain('January');
    });
  });
});
