/**
 * EmployeeCard Component
 * Card view for individual employee (mobile-friendly)
 */

import React from 'react';
import { motion } from 'framer-motion';
import { FiEdit, FiTrash2, FiMail, FiPhone, FiBriefcase } from 'react-icons/fi';
import { Employee } from '../../models/Employee.model';
import { formatDate, formatCurrency } from '../../utils/validation';

interface EmployeeCardProps {
  employee: Employee;
  onEdit: (employee: Employee) => void;
  onDelete: (employee: Employee) => void;
  index: number;
}

const EmployeeCard: React.FC<EmployeeCardProps> = ({ employee, onEdit, onDelete, index }) => {
  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      'Active': 'bg-green-100 text-green-800',
      'Inactive': 'bg-gray-100 text-gray-800',
      'Probation': 'bg-yellow-100 text-yellow-800',
      'On Leave': 'bg-blue-100 text-blue-800',
      'Terminated': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <img
            src={employee.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(employee.fullName)}&background=random`}
            alt={employee.fullName}
            className="w-16 h-16 rounded-full mr-4"
          />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{employee.fullName}</h3>
            <p className="text-sm text-gray-500">{employee.id}</p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(employee.status)}`}>
          {employee.status}
        </span>
      </div>

      {/* Details */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-700">
          <FiMail className="w-4 h-4 mr-2 text-gray-400" />
          {employee.email}
        </div>
        <div className="flex items-center text-sm text-gray-700">
          <FiPhone className="w-4 h-4 mr-2 text-gray-400" />
          {employee.phone}
        </div>
        <div className="flex items-center text-sm text-gray-700">
          <FiBriefcase className="w-4 h-4 mr-2 text-gray-400" />
          {employee.position} • {employee.department}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div>
          <p className="text-sm font-medium text-gray-900">{formatCurrency(employee.salary)}</p>
          <p className="text-xs text-gray-500">Joined {formatDate(employee.dateJoined)}</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(employee)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Edit"
          >
            <FiEdit className="w-5 h-5" />
          </button>
          <button
            onClick={() => onDelete(employee)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete"
          >
            <FiTrash2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default EmployeeCard;
