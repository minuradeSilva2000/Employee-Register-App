/**
 * Employee Service
 * Centralized business logic for employee operations
 * Mock implementation - ready to connect to real API
 */

import { Employee, EmployeeFormData, EmployeeStatus, Department, EmployeeFilters } from '../models/Employee.model';
import { generateMockEmployees } from '../utils/mockData';

class EmployeeService {
  private employees: Employee[] = [];
  private storageKey = 'employees_data';

  constructor() {
    this.loadFromStorage();
  }

  /**
   * Load employees from localStorage or generate mock data
   */
  private loadFromStorage(): void {
    const stored = localStorage.getItem(this.storageKey);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        this.employees = parsed.map((emp: any) => ({
          ...emp,
          dateJoined: new Date(emp.dateJoined),
          createdAt: new Date(emp.createdAt),
          updatedAt: new Date(emp.updatedAt)
        }));
      } catch (error) {
        console.error('Failed to load employees from storage:', error);
        this.employees = generateMockEmployees();
        this.saveToStorage();
      }
    } else {
      this.employees = generateMockEmployees();
      this.saveToStorage();
    }
  }

  /**
   * Save employees to localStorage
   */
  private saveToStorage(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.employees));
    } catch (error) {
      console.error('Failed to save employees to storage:', error);
    }
  }

  /**
   * Generate unique employee ID
   */
  private generateId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 7);
    return `EMP-${timestamp}-${random}`.toUpperCase();
  }

  /**
   * Get all employees
   */
  async getAllEmployees(): Promise<Employee[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...this.employees];
  }

  /**
   * Get employee by ID
   */
  async getEmployeeById(id: string): Promise<Employee | null> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return this.employees.find(emp => emp.id === id) || null;
  }

  /**
   * Create new employee
   */
  async createEmployee(formData: EmployeeFormData): Promise<Employee> {
    await new Promise(resolve => setTimeout(resolve, 400));

    const newEmployee: Employee = {
      id: this.generateId(),
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      department: formData.department as Department,
      position: formData.position,
      salary: typeof formData.salary === 'string' ? parseFloat(formData.salary) : formData.salary,
      dateJoined: new Date(formData.dateJoined),
      status: formData.status as EmployeeStatus,
      address: formData.address,
      emergencyContact: formData.emergencyContact,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.fullName)}&background=random`,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.employees.push(newEmployee);
    this.saveToStorage();
    return newEmployee;
  }

  /**
   * Update existing employee
   */
  async updateEmployee(id: string, formData: EmployeeFormData): Promise<Employee> {
    await new Promise(resolve => setTimeout(resolve, 400));

    const index = this.employees.findIndex(emp => emp.id === id);
    if (index === -1) {
      throw new Error('Employee not found');
    }

    const updatedEmployee: Employee = {
      ...this.employees[index],
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      department: formData.department as Department,
      position: formData.position,
      salary: typeof formData.salary === 'string' ? parseFloat(formData.salary) : formData.salary,
      dateJoined: new Date(formData.dateJoined),
      status: formData.status as EmployeeStatus,
      address: formData.address,
      emergencyContact: formData.emergencyContact,
      updatedAt: new Date()
    };

    this.employees[index] = updatedEmployee;
    this.saveToStorage();
    return updatedEmployee;
  }

  /**
   * Delete employee
   */
  async deleteEmployee(id: string): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 300));

    const index = this.employees.findIndex(emp => emp.id === id);
    if (index === -1) {
      throw new Error('Employee not found');
    }

    this.employees.splice(index, 1);
    this.saveToStorage();
    return true;
  }

  /**
   * Search employees
   */
  async searchEmployees(searchTerm: string): Promise<Employee[]> {
    await new Promise(resolve => setTimeout(resolve, 200));

    const term = searchTerm.toLowerCase().trim();
    if (!term) return this.employees;

    return this.employees.filter(emp =>
      emp.fullName.toLowerCase().includes(term) ||
      emp.email.toLowerCase().includes(term) ||
      emp.id.toLowerCase().includes(term) ||
      emp.phone.includes(term) ||
      emp.position.toLowerCase().includes(term)
    );
  }

  /**
   * Filter employees
   */
  async filterEmployees(filters: EmployeeFilters): Promise<Employee[]> {
    await new Promise(resolve => setTimeout(resolve, 200));

    let result = [...this.employees];

    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase().trim();
      result = result.filter(emp =>
        emp.fullName.toLowerCase().includes(term) ||
        emp.email.toLowerCase().includes(term) ||
        emp.id.toLowerCase().includes(term)
      );
    }

    if (filters.department) {
      result = result.filter(emp => emp.department === filters.department);
    }

    if (filters.status) {
      result = result.filter(emp => emp.status === filters.status);
    }

    return result;
  }

  /**
   * Get dashboard statistics
   */
  async getStatistics(): Promise<{
    totalEmployees: number;
    activeEmployees: number;
    departments: number;
    onProbation: number;
  }> {
    await new Promise(resolve => setTimeout(resolve, 200));

    const totalEmployees = this.employees.length;
    const activeEmployees = this.employees.filter(emp => emp.status === EmployeeStatus.ACTIVE).length;
    const departments = new Set(this.employees.map(emp => emp.department)).size;
    const onProbation = this.employees.filter(emp => emp.status === EmployeeStatus.PROBATION).length;

    return {
      totalEmployees,
      activeEmployees,
      departments,
      onProbation
    };
  }

  /**
   * Get employees by department
   */
  async getEmployeesByDepartment(department: Department): Promise<Employee[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return this.employees.filter(emp => emp.department === department);
  }

  /**
   * Get employees by status
   */
  async getEmployeesByStatus(status: EmployeeStatus): Promise<Employee[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return this.employees.filter(emp => emp.status === status);
  }
}

// Export singleton instance
export const employeeService = new EmployeeService();
