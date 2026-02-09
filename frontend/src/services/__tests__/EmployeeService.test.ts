/**
 * EmployeeService Tests
 * Unit tests for employee CRUD operations
 */

import { employeeService } from '../EmployeeService';
import { EmployeeFormData, Department, EmployeeStatus } from '../../models/Employee.model';

describe('EmployeeService', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  describe('getAllEmployees', () => {
    it('should return array of employees', async () => {
      const employees = await employeeService.getAllEmployees();
      expect(Array.isArray(employees)).toBe(true);
      expect(employees.length).toBeGreaterThan(0);
    });

    it('should return employees with correct structure', async () => {
      const employees = await employeeService.getAllEmployees();
      const employee = employees[0];
      
      expect(employee).toHaveProperty('id');
      expect(employee).toHaveProperty('fullName');
      expect(employee).toHaveProperty('email');
      expect(employee).toHaveProperty('department');
      expect(employee).toHaveProperty('status');
    });
  });

  describe('createEmployee', () => {
    it('should create new employee', async () => {
      const formData: EmployeeFormData = {
        fullName: 'Test Employee',
        email: 'test@example.com',
        phone: '+1-555-0100',
        department: Department.ENGINEERING,
        position: 'Software Engineer',
        salary: 75000,
        dateJoined: '2024-01-01',
        status: EmployeeStatus.ACTIVE,
        address: '123 Test St'
      };

      const employee = await employeeService.createEmployee(formData);
      
      expect(employee.fullName).toBe(formData.fullName);
      expect(employee.email).toBe(formData.email);
      expect(employee.id).toBeDefined();
      expect(employee.id).toContain('EMP-');
    });

    it('should generate unique IDs', async () => {
      const formData: EmployeeFormData = {
        fullName: 'Test Employee',
        email: 'test@example.com',
        phone: '+1-555-0100',
        department: Department.ENGINEERING,
        position: 'Software Engineer',
        salary: 75000,
        dateJoined: '2024-01-01',
        status: EmployeeStatus.ACTIVE
      };

      const employee1 = await employeeService.createEmployee(formData);
      const employee2 = await employeeService.createEmployee(formData);
      
      expect(employee1.id).not.toBe(employee2.id);
    });
  });

  describe('updateEmployee', () => {
    it('should update existing employee', async () => {
      const employees = await employeeService.getAllEmployees();
      const employeeToUpdate = employees[0];
      
      const formData: EmployeeFormData = {
        fullName: 'Updated Name',
        email: employeeToUpdate.email,
        phone: employeeToUpdate.phone,
        department: employeeToUpdate.department,
        position: employeeToUpdate.position,
        salary: employeeToUpdate.salary,
        dateJoined: employeeToUpdate.dateJoined.toISOString().split('T')[0],
        status: employeeToUpdate.status
      };

      const updated = await employeeService.updateEmployee(employeeToUpdate.id, formData);
      
      expect(updated.fullName).toBe('Updated Name');
      expect(updated.id).toBe(employeeToUpdate.id);
    });

    it('should throw error for non-existent employee', async () => {
      const formData: EmployeeFormData = {
        fullName: 'Test',
        email: 'test@example.com',
        phone: '+1-555-0100',
        department: Department.ENGINEERING,
        position: 'Engineer',
        salary: 75000,
        dateJoined: '2024-01-01',
        status: EmployeeStatus.ACTIVE
      };

      await expect(
        employeeService.updateEmployee('NON-EXISTENT-ID', formData)
      ).rejects.toThrow('Employee not found');
    });
  });

  describe('deleteEmployee', () => {
    it('should delete employee', async () => {
      const employees = await employeeService.getAllEmployees();
      const initialCount = employees.length;
      const employeeToDelete = employees[0];
      
      const result = await employeeService.deleteEmployee(employeeToDelete.id);
      
      expect(result).toBe(true);
      
      const updatedEmployees = await employeeService.getAllEmployees();
      expect(updatedEmployees.length).toBe(initialCount - 1);
    });

    it('should throw error for non-existent employee', async () => {
      await expect(
        employeeService.deleteEmployee('NON-EXISTENT-ID')
      ).rejects.toThrow('Employee not found');
    });
  });

  describe('searchEmployees', () => {
    it('should find employees by name', async () => {
      const employees = await employeeService.getAllEmployees();
      const searchTerm = employees[0].fullName.split(' ')[0];
      
      const results = await employeeService.searchEmployees(searchTerm);
      
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].fullName.toLowerCase()).toContain(searchTerm.toLowerCase());
    });

    it('should find employees by email', async () => {
      const employees = await employeeService.getAllEmployees();
      const searchTerm = employees[0].email.split('@')[0];
      
      const results = await employeeService.searchEmployees(searchTerm);
      
      expect(results.length).toBeGreaterThan(0);
    });

    it('should return all employees for empty search', async () => {
      const allEmployees = await employeeService.getAllEmployees();
      const results = await employeeService.searchEmployees('');
      
      expect(results.length).toBe(allEmployees.length);
    });
  });

  describe('filterEmployees', () => {
    it('should filter by department', async () => {
      const results = await employeeService.filterEmployees({
        department: Department.ENGINEERING
      });
      
      results.forEach(emp => {
        expect(emp.department).toBe(Department.ENGINEERING);
      });
    });

    it('should filter by status', async () => {
      const results = await employeeService.filterEmployees({
        status: EmployeeStatus.ACTIVE
      });
      
      results.forEach(emp => {
        expect(emp.status).toBe(EmployeeStatus.ACTIVE);
      });
    });

    it('should filter by multiple criteria', async () => {
      const results = await employeeService.filterEmployees({
        department: Department.ENGINEERING,
        status: EmployeeStatus.ACTIVE
      });
      
      results.forEach(emp => {
        expect(emp.department).toBe(Department.ENGINEERING);
        expect(emp.status).toBe(EmployeeStatus.ACTIVE);
      });
    });
  });

  describe('getStatistics', () => {
    it('should return correct statistics', async () => {
      const stats = await employeeService.getStatistics();
      
      expect(stats).toHaveProperty('totalEmployees');
      expect(stats).toHaveProperty('activeEmployees');
      expect(stats).toHaveProperty('departments');
      expect(stats).toHaveProperty('onProbation');
      
      expect(typeof stats.totalEmployees).toBe('number');
      expect(stats.totalEmployees).toBeGreaterThan(0);
    });
  });
});
