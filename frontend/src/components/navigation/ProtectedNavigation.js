import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

/**
 * Protected Navigation Component
 * Handles navigation to protected pages with proper authentication checks
 */
const ProtectedNavigation = ({ children, className = '' }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  /**
   * Navigate to protected pages with authentication check
   * @param {string} path - The path to navigate to
   * @param {string} pageName - Display name for the page (for error messages)
   */
  const navigateToProtectedPage = (path, pageName = 'this feature') => {
    if (!isAuthenticated) {
      toast.error('Login required to access this feature.', {
        duration: 4000,
        icon: '🔒',
        style: {
          background: '#ef4444',
          color: '#fff',
        },
      });
      navigate('/login', { replace: true });
      return;
    }
    
    // Navigate to the requested page
    navigate(path);
  };

  // Navigation functions for each protected page
  const navigationHandlers = {
    analytics: () => navigateToProtectedPage('/dashboard', 'Analytics'),
    management: () => navigateToProtectedPage('/admin/dashboard', 'Management'),
    departmentManagement: () => navigateToProtectedPage('/departments', 'Department Management'),
    employeeManagement: () => navigateToProtectedPage('/employees', 'Employee Management'),
    attendance: () => navigateToProtectedPage('/attendance', 'Attendance'),
    users: () => navigateToProtectedPage('/users', 'User Management'),
    profile: () => navigateToProtectedPage('/profile', 'Profile'),
    settings: () => navigateToProtectedPage('/settings', 'Settings'),
  };

  return (
    <div className={className}>
      {React.cloneElement(children, { navigationHandlers })}
    </div>
  );
};

export default ProtectedNavigation;