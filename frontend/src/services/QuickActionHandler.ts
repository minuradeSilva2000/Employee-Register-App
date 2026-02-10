/**
 * AI-Powered Quick Action Handler
 * Single intelligent function that handles ALL quick actions
 * Extensible, type-safe, and scalable architecture
 */

import { QuickActionType, QuickActionPayload, QuickActionResult } from '../models/QuickAction.model';
import { EmployeeFormData } from '../models/Employee.model';
import { employeeService } from './EmployeeService';

/**
 * Action Handler Interface
 * Defines the contract for all action handlers
 */
interface ActionHandler<T = any> {
  execute: (payload: QuickActionPayload) => Promise<QuickActionResult<T>>;
  validate?: (payload: QuickActionPayload) => boolean;
  requiresEmployee?: boolean;
}

/**
 * Action Registry
 * Maps action types to their handlers
 */
class QuickActionRegistry {
  private handlers: Map<QuickActionType, ActionHandler> = new Map();

  /**
   * Register an action handler
   */
  register(type: QuickActionType, handler: ActionHandler): void {
    this.handlers.set(type, handler);
  }

  /**
   * Get handler for action type
   */
  getHandler(type: QuickActionType): ActionHandler | undefined {
    return this.handlers.get(type);
  }

  /**
   * Check if action type is registered
   */
  hasHandler(type: QuickActionType): boolean {
    return this.handlers.has(type);
  }
}

/**
 * Create Action Registry and register all handlers
 */
const registry = new QuickActionRegistry();

// ==================== ACTION HANDLERS ====================

/**
 * Add Employee Handler
 */
registry.register(QuickActionType.ADD_EMPLOYEE, {
  requiresEmployee: false,
  validate: (payload) => {
    return payload.data && typeof payload.data === 'object';
  },
  execute: async (payload) => {
    try {
      const formData = payload.data as EmployeeFormData;
      const employee = await employeeService.createEmployee(formData);
      
      return {
        success: true,
        data: employee,
        message: `Employee ${employee.fullName} added successfully`
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to add employee'
      };
    }
  }
});

/**
 * View Employees Handler
 */
registry.register(QuickActionType.VIEW_EMPLOYEES, {
  requiresEmployee: false,
  execute: async () => {
    try {
      const employees = await employeeService.getAllEmployees();
      
      return {
        success: true,
        data: employees,
        message: `Retrieved ${employees.length} employees`
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to retrieve employees'
      };
    }
  }
});

/**
 * Update Employee Handler
 */
registry.register(QuickActionType.UPDATE_EMPLOYEE, {
  requiresEmployee: true,
  validate: (payload) => {
    return !!payload.employee && payload.data && typeof payload.data === 'object';
  },
  execute: async (payload) => {
    try {
      if (!payload.employee) {
        throw new Error('Employee is required for update action');
      }

      const formData = payload.data as EmployeeFormData;
      const employee = await employeeService.updateEmployee(payload.employee.id, formData);
      
      return {
        success: true,
        data: employee,
        message: `Employee ${employee.fullName} updated successfully`
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update employee'
      };
    }
  }
});

/**
 * Delete Employee Handler
 */
registry.register(QuickActionType.DELETE_EMPLOYEE, {
  requiresEmployee: true,
  validate: (payload) => {
    return !!payload.employee;
  },
  execute: async (payload) => {
    try {
      if (!payload.employee) {
        throw new Error('Employee is required for delete action');
      }

      await employeeService.deleteEmployee(payload.employee.id);
      
      return {
        success: true,
        data: payload.employee.id,
        message: `Employee ${payload.employee.fullName} deleted successfully`
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete employee'
      };
    }
  }
});

/**
 * Search Employee Handler
 */
registry.register(QuickActionType.SEARCH_EMPLOYEE, {
  requiresEmployee: false,
  validate: (payload) => {
    return payload.data && typeof payload.data.searchTerm === 'string';
  },
  execute: async (payload) => {
    try {
      const searchTerm = payload.data?.searchTerm || '';
      const employees = await employeeService.searchEmployees(searchTerm);
      
      return {
        success: true,
        data: employees,
        message: `Found ${employees.length} employees matching "${searchTerm}"`
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to search employees'
      };
    }
  }
});

/**
 * Filter Employees Handler
 */
registry.register(QuickActionType.FILTER_EMPLOYEES, {
  requiresEmployee: false,
  execute: async (payload) => {
    try {
      const filters = payload.data || {};
      const employees = await employeeService.filterEmployees(filters);
      
      return {
        success: true,
        data: employees,
        message: `Filtered to ${employees.length} employees`
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to filter employees'
      };
    }
  }
});

// ==================== MAIN HANDLER ====================

/**
 * AI-Powered Quick Action Handler
 * Single intelligent function that routes and executes all actions
 * 
 * @param payload - Action payload with type and data
 * @returns Promise with action result
 * 
 * ARCHITECTURE BENEFITS:
 * 1. Single entry point for all actions
 * 2. Type-safe with TypeScript
 * 3. Extensible - add new actions by registering handlers
 * 4. Testable - each handler can be tested independently
 * 5. Maintainable - clear separation of concerns
 */
export async function handleQuickAction<T = any>(
  payload: QuickActionPayload
): Promise<QuickActionResult<T>> {
  try {
    // Validate action type
    if (!registry.hasHandler(payload.type)) {
      return {
        success: false,
        error: `Unknown action type: ${payload.type}`
      };
    }

    // Get handler
    const handler = registry.getHandler(payload.type);
    if (!handler) {
      return {
        success: false,
        error: 'Action handler not found'
      };
    }

    // Validate payload if handler has validation
    if (handler.validate && !handler.validate(payload)) {
      return {
        success: false,
        error: 'Invalid payload for action'
      };
    }

    // Check if employee is required
    if (handler.requiresEmployee && !payload.employee) {
      return {
        success: false,
        error: 'This action requires an employee to be selected'
      };
    }

    // Execute handler
    const result = await handler.execute(payload);
    return result as QuickActionResult<T>;

  } catch (error) {
    console.error('Quick action error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    };
  }
}

/**
 * Get action metadata
 */
export function getActionMetadata(type: QuickActionType): {
  requiresEmployee: boolean;
  hasValidation: boolean;
} {
  const handler = registry.getHandler(type);
  return {
    requiresEmployee: handler?.requiresEmployee || false,
    hasValidation: !!handler?.validate
  };
}

/**
 * Check if action is available
 */
export function isActionAvailable(type: QuickActionType): boolean {
  return registry.hasHandler(type);
}

/**
 * Get all registered action types
 */
export function getRegisteredActions(): QuickActionType[] {
  return Array.from(registry['handlers'].keys());
}
