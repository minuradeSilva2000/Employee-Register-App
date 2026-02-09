/**
 * EmployeeList Component
 * Displays list of employees with actions
 */

import React from 'react';
import { motion } from 'framer-motion';
import { FiEdit, FiTrash2, FiMail, FiPhone } from 'react-icons/fi';
import { Employee, EmployeeStatus, Department } from '../../models/Employee.model';
import { formatDate, formatCurrency } from '../../utils/validation';

interface EmployeeListProps {
  employees: Employee[];
  onEdit: (employee: Employee) => void;
  onDelete: (employee: Employee) => void;
}

const EmployeeList: React.FC<EmployeeListProps> = ({ employees, onEdit, onDelete }) => {
  const getStatusColor = (status: EmployeeStatus): string => {
    const colors: Record<EmployeeStatus, string> = {
      [EmployeeStatus.ACTIVE]: 'bg-green-100 text-green-800',
      [EmployeeStatus.INACTIVE]: 'bg-gray-100 text-gray-800',
      [EmployeeStatus.PROBATION]: 'bg-yellow-100 text-yellow-800',
      [EmployeeStatus.ON_LEAVE]: 'bg-blue-100 text-blue-800',
      [EmployeeStatus.TERMINATED]: 'bg-red-100 text-red-800'
    };
    return colors[status];
  };

  const getDepartmentColor = (department: Department): string => {
    const colors: Record<Department, string> = {
      [Department.ENGINEERING]: 'bg-blue-100 text-blue-800',
      [Department.HUMAN_RESOURCES]: 'bg-purple-100 text-purple-800',
      [Department.SALES]: 'bg-green-100 text-green-800',
      [Department.MARKETING]: 'bg-pink-100 text-pink-800',
      [Department.FINANCE]: 'bg-yellow-100 text-yellow-800',
      [Department.OPERATIONS]: 'bg-orange-100 text-orange-800',
      [Department.IT]: 'bg-indigo-100 text-indigo-800',
      [Department.CUSTOMER_SUPPORT]: 'bg-teal-100 text-teal-800'
    };
    return colors[department];
  };

  if (employees.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">👥</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No Employees Found</h3>
        <p className="text-gray-500">Add your first employee to get started</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <tr>
            <th className="px-6 py-4 text-left text-sm font-semibold">Employee</th>
            <th className="px-6 py-4 text-left text-sm font-semibold">Contact</th>
            <th className="px-6 py-4 text-left text-sm font-semibold">Department</th>
            <th className="px-6 py-4 text-left text-sm font-semibold">Position</th>
            <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
            <th className="px-6 py-4 text-left text-sm font-semibold">Salary</th>
            <th className="px-6 py-4 text-left text-sm font-semibold">Joined</th>
            <th className="px-6 py-4 text-center text-sm font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {employees.map((employee, index) => (
            <motion.tr
              key={employee.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="hover:bg-gray-50 transition-colors"
            >
              <td className="px-6 py-4">
                <div className="flex items-center">
                  <img
                    src={employee.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(employee.fullName)}&background=random`}
                    alt={employee.fullName}
                    className="w-10 h-10 rounded-full mr-3"
                  />
                  <div>
                    <div className="font-semibold text-gray-900">{employee.fullName}</div>
                    <div className="text-sm text-gray-500">{employee.id}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex flex-col space-y-1">
                  <div className="flex items-center text-sm text-gray-900">
                    <FiMail className="w-4 h-4 mr-2 text-gray-400" />
                    {employee.email}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <FiPhone className="w-4 h-4 mr-2 text-gray-400" />
                    {employee.phone}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDepartmentColor(employee.department)}`}>
                  {employee.department}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-gray-700">{employee.position}</td>
              <td className="px-6 py-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(employee.status)}`}>
                  {employee.status}
                </span>
              </td>
              <td className="px-6 py-4 text-sm font-medium text-gray-900">
                {formatCurrency(employee.salary)}
              </td>
              <td className="px-6 py-4 text-sm text-gray-700">
                {formatDate(employee.dateJoined)}
              </td>
              <td className="px-6 py-4">
                <div className="flex justify-center space-x-2">
                  <button
                    onClick={() => onEdit(employee)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit Employee"
                  >
                    <FiEdit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => onDelete(employee)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Employee"
                  >
                    <FiTrash2 className="w-5 h-5" />
                  </button>
                </div>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EmployeeList;
