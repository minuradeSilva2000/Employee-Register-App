/**
 * Mock Data for Employee Management System
 * Sample data for development and testing
 */

import { Employee, Department, Role, EmployeeStatus } from '../types/employee.types';

export const mockEmployees: Employee[] = [
  {
    id: 'EMP-001',
    fullName: 'John Smith',
    email: 'john.smith@company.com',
    phone: '+1-555-0101',
    department: Department.ENGINEERING,
    role: Role.SENIOR_SOFTWARE_ENGINEER,
    status: EmployeeStatus.ACTIVE,
    dateJoined: new Date('2021-03-15'),
    avatar: 'https://i.pravatar.cc/150?img=12',
    salary: 95000,
    address: '123 Tech Street, San Francisco, CA'
  },
  {
    id: 'EMP-002',
    fullName: 'Sarah Johnson',
    email: 'sarah.johnson@company.com',
    phone: '+1-555-0102',
    department: Department.HUMAN_RESOURCES,
    role: Role.HR_MANAGER,
    status: EmployeeStatus.ACTIVE,
    dateJoined: new Date('2020-06-10'),
    avatar: 'https://i.pravatar.cc/150?img=5',
    salary: 80000,
    address: '456 HR Avenue, New York, NY'
  },
  {
    id: 'EMP-003',
    fullName: 'Michael Chen',
    email: 'michael.chen@company.com',
    phone: '+1-555-0103',
    department: Department.SALES,
    role: Role.SALES_MANAGER,
    status: EmployeeStatus.ACTIVE,
    dateJoined: new Date('2019-09-20'),
    avatar: 'https://i.pravatar.cc/150?img=33',
    salary: 85000,
    address: '789 Sales Road, Chicago, IL'
  },
  {
    id: 'EMP-004',
    fullName: 'Emily Davis',
    email: 'emily.davis@company.com',
    phone: '+1-555-0104',
    department: Department.MARKETING,
    role: Role.MARKETING_MANAGER,
    status: EmployeeStatus.ACTIVE,
    dateJoined: new Date('2022-01-05'),
    avatar: 'https://i.pravatar.cc/150?img=9',
    salary: 78000,
    address: '321 Marketing Lane, Los Angeles, CA'
  },
  {
    id: 'EMP-005',
    fullName: 'David Wilson',
    email: 'david.wilson@company.com',
    phone: '+1-555-0105',
    department: Department.ENGINEERING,
    role: Role.SOFTWARE_ENGINEER,
    status: EmployeeStatus.PROBATION,
    dateJoined: new Date('2024-10-01'),
    avatar: 'https://i.pravatar.cc/150?img=15',
    salary: 72000,
    address: '654 Code Street, Austin, TX'
  },
  {
    id: 'EMP-006',
    fullName: 'Lisa Anderson',
    email: 'lisa.anderson@company.com',
    phone: '+1-555-0106',
    department: Department.FINANCE,
    role: Role.FINANCIAL_ANALYST,
    status: EmployeeStatus.ACTIVE,
    dateJoined: new Date('2021-11-12'),
    avatar: 'https://i.pravatar.cc/150?img=20',
    salary: 76000,
    address: '987 Finance Blvd, Boston, MA'
  },
  {
    id: 'EMP-007',
    fullName: 'Robert Taylor',
    email: 'robert.taylor@company.com',
    phone: '+1-555-0107',
    department: Department.IT,
    role: Role.IT_SUPPORT,
    status: EmployeeStatus.ACTIVE,
    dateJoined: new Date('2022-04-18'),
    avatar: 'https://i.pravatar.cc/150?img=51',
    salary: 65000,
    address: '147 IT Park, Seattle, WA'
  },
  {
    id: 'EMP-008',
    fullName: 'Jennifer Martinez',
    email: 'jennifer.martinez@company.com',
    phone: '+1-555-0108',
    department: Department.CUSTOMER_SUPPORT,
    role: Role.CUSTOMER_SERVICE_REP,
    status: EmployeeStatus.ON_LEAVE,
    dateJoined: new Date('2023-02-14'),
    avatar: 'https://i.pravatar.cc/150?img=27',
    salary: 55000,
    address: '258 Support Street, Miami, FL'
  },
  {
    id: 'EMP-009',
    fullName: 'James Brown',
    email: 'james.brown@company.com',
    phone: '+1-555-0109',
    department: Department.OPERATIONS,
    role: Role.OPERATIONS_MANAGER,
    status: EmployeeStatus.ACTIVE,
    dateJoined: new Date('2020-08-25'),
    avatar: 'https://i.pravatar.cc/150?img=60',
    salary: 82000,
    address: '369 Operations Way, Denver, CO'
  },
  {
    id: 'EMP-010',
    fullName: 'Amanda White',
    email: 'amanda.white@company.com',
    phone: '+1-555-0110',
    department: Department.ENGINEERING,
    role: Role.TECH_LEAD,
    status: EmployeeStatus.ACTIVE,
    dateJoined: new Date('2019-05-30'),
    avatar: 'https://i.pravatar.cc/150?img=16',
    salary: 105000,
    address: '741 Tech Plaza, Portland, OR'
  }
];
