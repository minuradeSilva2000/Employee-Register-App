/**
 * Mock Data Generator
 * Generates realistic employee data for development
 */

import { Employee, EmployeeStatus, Department } from '../models/Employee.model';

const firstNames = ['John', 'Sarah', 'Michael', 'Emily', 'David', 'Lisa', 'Robert', 'Jennifer', 'James', 'Amanda'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];

const positions: Record<Department, string[]> = {
  [Department.ENGINEERING]: ['Software Engineer', 'Senior Software Engineer', 'Tech Lead', 'Engineering Manager'],
  [Department.HUMAN_RESOURCES]: ['HR Manager', 'HR Specialist', 'Recruiter', 'HR Coordinator'],
  [Department.SALES]: ['Sales Executive', 'Sales Manager', 'Account Manager', 'Business Development'],
  [Department.MARKETING]: ['Marketing Manager', 'Marketing Specialist', 'Content Creator', 'SEO Specialist'],
  [Department.FINANCE]: ['Financial Analyst', 'Accountant', 'Finance Manager', 'Controller'],
  [Department.OPERATIONS]: ['Operations Manager', 'Operations Coordinator', 'Logistics Manager'],
  [Department.IT]: ['IT Support', 'System Administrator', 'Network Engineer', 'IT Manager'],
  [Department.CUSTOMER_SUPPORT]: ['Customer Service Rep', 'Support Manager', 'Technical Support']
};

/**
 * Generate random employee
 */
function generateRandomEmployee(index: number): Employee {
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  const fullName = `${firstName} ${lastName}`;
  
  const departments = Object.values(Department);
  const department = departments[Math.floor(Math.random() * departments.length)];
  const position = positions[department][Math.floor(Math.random() * positions[department].length)];
  
  const statuses = Object.values(EmployeeStatus);
  const status = index < 8 ? EmployeeStatus.ACTIVE : statuses[Math.floor(Math.random() * statuses.length)];
  
  const dateJoined = new Date();
  dateJoined.setMonth(dateJoined.getMonth() - Math.floor(Math.random() * 36));
  
  return {
    id: `EMP-${String(index + 1).padStart(3, '0')}`,
    fullName,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@company.com`,
    phone: `+1-555-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
    department,
    position,
    salary: 50000 + Math.floor(Math.random() * 100000),
    dateJoined,
    status,
    address: `${Math.floor(Math.random() * 9999)} ${lastName} Street, City, State ${String(Math.floor(Math.random() * 99999)).padStart(5, '0')}`,
    avatar: `https://i.pravatar.cc/150?img=${index + 1}`,
    emergencyContact: {
      name: `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`,
      phone: `+1-555-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
      relationship: ['Spouse', 'Parent', 'Sibling', 'Friend'][Math.floor(Math.random() * 4)]
    },
    createdAt: new Date(dateJoined.getTime() - 86400000),
    updatedAt: new Date()
  };
}

/**
 * Generate mock employees
 */
export function generateMockEmployees(count: number = 10): Employee[] {
  return Array.from({ length: count }, (_, index) => generateRandomEmployee(index));
}
