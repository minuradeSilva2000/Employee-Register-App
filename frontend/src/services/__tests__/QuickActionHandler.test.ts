/**
 * QuickActionHandler Tests
 * Unit tests for AI-powered action handler
 */

import { handleQuickAction, getActionMetadata, isActionAvailable } from '../QuickActionHandler';
import { QuickActionType } from '../../models/QuickAction.model';
import { Department, EmployeeStatus, EmployeeFormData } from '../../models/Employee.model';

describe('QuickActionHandler', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('handleQuickAction', () => {
    it('should handle ADD_EMPLOYEE action', async () => {
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

      const result = await handleQuickAction({
        type: QuickActionType.ADD_EMPLOYEE,
        data: formData
      });

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.message).toContain('added successfully');
    });

    it('should handle VIEW_EMPLOYEES action', async () => {
      const result = await handleQuickAction({
        type: QuickActionType.VIEW_EMPLOYEES
      });

      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data.length).toBeGreaterThan(0);
    });

    it('should handle SEARCH_EMPLOYEE action', async () => {
      const result = await handleQuickAction({
        type: QuickActionType.SEARCH_EMPLOYEE,
        data: { searchTerm: 'test' }
      });

      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('should return error for unknown action type', async () => {
      const result = await handleQuickAction({
        type: 'UNKNOWN_ACTION' as QuickActionType
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should validate required employee for UPDATE action', async () => {
      const result = await handleQuickAction({
        type: QuickActionType.UPDATE_EMPLOYEE,
        data: {}
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Employee is required');
    });
  });

  describe('getActionMetadata', () => {
    it('should return correct metadata for ADD_EMPLOYEE', () => {
      const metadata = getActionMetadata(QuickActionType.ADD_EMPLOYEE);
      
      expect(metadata.requiresEmployee).toBe(false);
      expect(typeof metadata.hasValidation).toBe('boolean');
    });

    it('should return correct metadata for UPDATE_EMPLOYEE', () => {
      const metadata = getActionMetadata(QuickActionType.UPDATE_EMPLOYEE);
      
      expect(metadata.requiresEmployee).toBe(true);
    });

    it('should return correct metadata for DELETE_EMPLOYEE', () => {
      const metadata = getActionMetadata(QuickActionType.DELETE_EMPLOYEE);
      
      expect(metadata.requiresEmployee).toBe(true);
    });
  });

  describe('isActionAvailable', () => {
    it('should return true for registered actions', () => {
      expect(isActionAvailable(QuickActionType.ADD_EMPLOYEE)).toBe(true);
      expect(isActionAvailable(QuickActionType.VIEW_EMPLOYEES)).toBe(true);
      expect(isActionAvailable(QuickActionType.UPDATE_EMPLOYEE)).toBe(true);
      expect(isActionAvailable(QuickActionType.DELETE_EMPLOYEE)).toBe(true);
      expect(isActionAvailable(QuickActionType.SEARCH_EMPLOYEE)).toBe(true);
      expect(isActionAvailable(QuickActionType.FILTER_EMPLOYEES)).toBe(true);
    });

    it('should return false for unregistered actions', () => {
      expect(isActionAvailable('UNKNOWN_ACTION' as QuickActionType)).toBe(false);
    });
  });

  describe('Action Handler Integration', () => {
    it('should complete full CRUD cycle', async () => {
      // Create
      const createData: EmployeeFormData = {
        fullName: 'Integration Test',
        email: 'integration@test.com',
        phone: '+1-555-9999',
        department: Department.IT,
        position: 'Test Engineer',
        salary: 80000,
        dateJoined: '2024-01-01',
        status: EmployeeStatus.ACTIVE
      };

      const createResult = await handleQuickAction({
        type: QuickActionType.ADD_EMPLOYEE,
        data: createData
      });

      expect(createResult.success).toBe(true);
      const createdEmployee = createResult.data;

      // Read
      const readResult = await handleQuickAction({
        type: QuickActionType.VIEW_EMPLOYEES
      });

      expect(readResult.success).toBe(true);
      expect(readResult.data.some((emp: any) => emp.id === createdEmployee.id)).toBe(true);

      // Update
      const updateData: EmployeeFormData = {
        ...createData,
        fullName: 'Updated Integration Test'
      };

      const updateResult = await handleQuickAction({
        type: QuickActionType.UPDATE_EMPLOYEE,
        employee: createdEmployee,
        data: updateData
      });

      expect(updateResult.success).toBe(true);
      expect(updateResult.data.fullName).toBe('Updated Integration Test');

      // Delete
      const deleteResult = await handleQuickAction({
        type: QuickActionType.DELETE_EMPLOYEE,
        employee: createdEmployee
      });

      expect(deleteResult.success).toBe(true);
    });
  });
});
