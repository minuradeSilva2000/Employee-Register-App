/**
 * Custom Hook for Employee Management
 * Centralized state management for employees
 */

import { useState, useCallback, useMemo } from 'react';
import { Employee, EmployeeFormData, EmployeeFilters, Department, Role, EmployeeStatus } from '../types/employee.types';
import { mockEmployees } from '../data/mockData';
import { generateEmployeeId } from '../utils/aiHelper';

export const useEmployees = () => {
  const [employees, setEmployees] = useState<Employee[]>(mockEmployees);
  const [filters, setFilters] = useState<EmployeeFilters>({});

  /**
   * Add new employee
   */
  const addEmployee = useCallback((formData: EmployeeFormData): Employee => {
    const newEmployee: Employee = {
      id: generateEmployeeId(),
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      department: formData.department as Department,
      role: formData.role as Role,
      status: formData.status as EmployeeStatus,
      dateJoined: new Date(formData.dateJoined),
      avatar: formData.avatar || `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`,
      salary: formData.salary ? parseFloat(formData.salary) : undefined,
      address: formData.address
    };

    setEmployees(prev => [...prev, newEmployee]);
    return newEmployee;
  }, []);

  /**
   * Update existing employee
   */
  const updateEmployee = useCallback((id: string, formData: EmployeeFormData): Employee | null => {
    let updatedEmployee: Employee | null = null;

    setEmployees(prev => prev.map(emp => {
      if (emp.id === id) {
        updatedEmployee = {
          ...emp,
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          department: formData.department as Department,
          role: formData.role as Role,
          status: formData.status as EmployeeStatus,
          dateJoined: new Date(formData.dateJoined),
          avatar: formData.avatar || emp.avatar,
          salary: formData.salary ? parseFloat(formData.salary) : emp.salary,
          address: formData.address || emp.address
        };
        return updatedEmployee;
      }
      return emp;
    }));

    return updatedEmployee;
  }, []);

  /**
   * Delete employee
   */
  const deleteEmployee = useCallback((id: string): boolean => {
    const initialLength = employees.length;
    setEmployees(prev => prev.filter(emp => emp.id !== id));
    return employees.length !== initialLength;
  }, [employees.length]);

  /**
   * Get employee by ID
   */
  const getEmployeeById = useCallback((id: string): Employee | undefined => {
    return employees.find(emp => emp.id === id);
  }, [employees]);

  /**
   * Assign department to employee
   */
  const assignDepartment = useCallback((id: string, department: Department): boolean => {
    let success = false;
    setEmployees(prev => prev.map(emp => {
      if (emp.id === id) {
        success = true;
        return { ...emp, department };
      }
      return emp;
    }));
    return success;
  }, []);

  /**
   * Search employees
   */
  const searchEmployees = useCallback((searchTerm: string): Employee[] => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return employees;

    return employees.filter(emp =>
      emp.fullName.toLowerCase().includes(term) ||
      emp.email.toLowerCase().includes(term) ||
      emp.id.toLowerCase().includes(term) ||
      emp.phone.includes(term)
    );
  }, [employees]);

  /**
   * Filter employees based on criteria
   */
  const filteredEmployees = useMemo(() => {
    let result = [...employees];

    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase().trim();
      result = result.filter(emp =>
        emp.fullName.toLowerCase().includes(term) ||
        emp.email.toLowerCase().includes(term) ||
        emp.id.toLowerCase().includes(term) ||
        emp.phone.includes(term)
      );
    }

    if (filters.department) {
      result = result.filter(emp => emp.department === filters.department);
    }

    if (filters.status) {
      result = result.filter(emp => emp.status === filters.status);
    }

    if (filters.role) {
      result = result.filter(emp => emp.role === filters.role);
    }

    return result;
  }, [employees, filters]);

  /**
   * Get statistics
   */
  const statistics = useMemo(() => {
    const totalEmployees = employees.length;
    const activeEmployees = employees.filter(emp => emp.status === EmployeeStatus.ACTIVE).length;
    const departments = new Set(employees.map(emp => emp.department)).size;
    const pendingRequests = employees.filter(emp => emp.status === EmployeeStatus.PROBATION).length;

    return {
      totalEmployees,
      activeEmployees,
      departments,
      pendingRequests
    };
  }, [employees]);

  /**
   * Get employees by department
   */
  const getEmployeesByDepartment = useCallback((department: Department): Employee[] => {
    return employees.filter(emp => emp.department === department);
  }, [employees]);

  /**
   * Get employees by status
   */
  const getEmployeesByStatus = useCallback((status: EmployeeStatus): Employee[] => {
    return employees.filter(emp => emp.status === status);
  }, [employees]);

  return {
    employees: filteredEmployees,
    allEmployees: employees,
    statistics,
    filters,
    setFilters,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    getEmployeeById,
    assignDepartment,
    searchEmployees,
    getEmployeesByDepartment,
    getEmployeesByStatus
  };
};
