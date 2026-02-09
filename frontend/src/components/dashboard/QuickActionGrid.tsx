/**
 * QuickActionGrid Component
 * Displays grid of quick action buttons
 */

import React from 'react';
import { motion } from 'framer-motion';
import { FiUserPlus, FiUsers, FiEdit, FiTrash2, FiSearch, FiFilter } from 'react-icons/fi';
import { QuickActionType } from '../../models/QuickAction.model';
import { Employee } from '../../models/Employee.model';

interface QuickAction {
  id: string;
  type: QuickActionType;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

interface QuickActionGridProps {
  onActionClick: (type: QuickActionType, employee?: Employee) => void;
}

const QuickActionGrid: React.FC<QuickActionGridProps> = ({ onActionClick }) => {
  const quickActions: QuickAction[] = [
    {
      id: '1',
      type: QuickActionType.ADD_EMPLOYEE,
      title: 'Add Employee',
      description: 'Create a new employee record',
      icon: <FiUserPlus className="w-6 h-6" />,
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: '2',
      type: QuickActionType.VIEW_EMPLOYEES,
      title: 'View Employees',
      description: 'Browse all employee records',
      icon: <FiUsers className="w-6 h-6" />,
      color: 'from-green-500 to-green-600'
    },
    {
      id: '3',
      type: QuickActionType.UPDATE_EMPLOYEE,
      title: 'Update Employee',
      description: 'Edit employee information',
      icon: <FiEdit className="w-6 h-6" />,
      color: 'from-purple-500 to-purple-600'
    },
    {
      id: '4',
      type: QuickActionType.DELETE_EMPLOYEE,
      title: 'Delete Employee',
      description: 'Remove employee record',
      icon: <FiTrash2 className="w-6 h-6" />,
      color: 'from-red-500 to-red-600'
    },
    {
      id: '5',
      type: QuickActionType.SEARCH_EMPLOYEE,
      title: 'Search Employee',
      description: 'Find specific employees',
      icon: <FiSearch className="w-6 h-6" />,
      color: 'from-orange-500 to-orange-600'
    },
    {
      id: '6',
      type: QuickActionType.FILTER_EMPLOYEES,
      title: 'Filter Employees',
      description: 'Filter by department or status',
      icon: <FiFilter className="w-6 h-6" />,
      color: 'from-indigo-500 to-indigo-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {quickActions.map((action, index) => (
        <motion.button
          key={action.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ scale: 1.05, y: -5 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onActionClick(action.type)}
          className={`
            relative overflow-hidden rounded-xl p-6 text-left
            bg-gradient-to-br ${action.color}
            text-white shadow-lg hover:shadow-2xl
            transform transition-all duration-300
            focus:outline-none focus:ring-4 focus:ring-opacity-50
          `}
        >
          {/* Background Pattern */}
          <div className="absolute top-0 right-0 -mt-4 -mr-4 opacity-20">
            <div className="text-8xl">{action.icon}</div>
          </div>

          {/* Content */}
          <div className="relative z-10">
            <div className="text-4xl mb-3">{action.icon}</div>
            <h3 className="text-xl font-bold mb-2">{action.title}</h3>
            <p className="text-sm opacity-90">{action.description}</p>
          </div>

          {/* Hover Effect */}
          <div className="absolute inset-0 bg-white opacity-0 hover:opacity-10 transition-opacity duration-300" />
        </motion.button>
      ))}
    </div>
  );
};

export default QuickActionGrid;
