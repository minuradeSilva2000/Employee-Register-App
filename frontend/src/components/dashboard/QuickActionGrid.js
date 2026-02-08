import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  FiTrendingUp, 
  FiBriefcase, 
  FiUsers, 
  FiUser, 
  FiCalendar,
  FiSettings,
  FiBarChart,
  FiPieChart
} from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';

const QuickActionGrid = () => {
  const navigate = useNavigate();
  const { user, hasAnyRole } = useAuth();

  // Quick actions available after login
  const quickActions = [
    {
      id: 'analytics',
      title: 'Analytics',
      description: 'View reports and insights',
      icon: FiTrendingUp,
      color: 'from-orange-500 to-orange-600',
      route: '/dashboard',
      roles: ['Admin', 'HR', 'Viewer'],
      stats: 'Dashboard & Reports'
    },
    {
      id: 'management',
      title: 'Management',
      description: 'Administrative controls and summaries',
      icon: FiBriefcase,
      color: 'from-purple-500 to-purple-600',
      route: '/admin/dashboard',
      roles: ['Admin'],
      stats: 'Admin Only'
    },
    {
      id: 'departments',
      title: 'Department Management',
      description: 'Organize departments and job roles',
      icon: FiUsers,
      color: 'from-green-500 to-green-600',
      route: '/departments',
      roles: ['Admin', 'HR'],
      stats: 'Manage Departments'
    },
    {
      id: 'employees',
      title: 'Employee Management',
      description: 'Add, edit, and manage employee records',
      icon: FiUser,
      color: 'from-blue-500 to-blue-600',
      route: '/employees',
      roles: ['Admin', 'HR'],
      stats: 'Manage Employees'
    },
    {
      id: 'attendance',
      title: 'Attendance',
      description: 'Track employee attendance and time',
      icon: FiCalendar,
      color: 'from-indigo-500 to-indigo-600',
      route: '/attendance',
      roles: ['Admin', 'HR', 'Viewer'],
      stats: 'Time Tracking'
    },
    {
      id: 'job-titles',
      title: 'Job Titles',
      description: 'Manage job positions and roles',
      icon: FiSettings,
      color: 'from-teal-500 to-teal-600',
      route: '/job-titles',
      roles: ['Admin', 'HR'],
      stats: 'Position Management'
    },
    {
      id: 'users',
      title: 'User Management',
      description: 'Manage system users and permissions',
      icon: FiBarChart,
      color: 'from-red-500 to-red-600',
      route: '/users',
      roles: ['Admin'],
      stats: 'Admin Only'
    },
    {
      id: 'reports',
      title: 'Reports',
      description: 'Generate and view detailed reports',
      icon: FiPieChart,
      color: 'from-pink-500 to-pink-600',
      route: '/dashboard',
      roles: ['Admin', 'HR', 'Viewer'],
      stats: 'Analytics & Reports'
    }
  ];

  // Filter actions based on user role
  const availableActions = quickActions.filter(action => 
    hasAnyRole(action.roles)
  );

  const handleActionClick = (action) => {
    navigate(action.route);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {availableActions.map((action, index) => (
        <motion.div
          key={action.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.1 }}
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleActionClick(action)}
          className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden border border-gray-100"
        >
          <div className={`h-2 bg-gradient-to-r ${action.color}`} />
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg bg-gradient-to-r ${action.color}`}>
                <action.icon className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                {action.stats}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {action.title}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {action.description}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">
                Role: {user?.role}
              </span>
              <svg 
                className="w-4 h-4 text-gray-400" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M9 5l7 7-7 7" 
                />
              </svg>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default QuickActionGrid;