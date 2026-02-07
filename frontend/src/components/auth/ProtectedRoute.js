import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../ui/LoadingSpinner';

const ProtectedRoute = ({ children, requiredRoles = [], requiredPermissions = [] }) => {
  const { isAuthenticated, isLoading, user, hasRole, hasPermission, hasAnyRole, hasAnyPermission } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="text-center"
        >
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Verifying authentication...</p>
        </motion.div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role requirements
  if (requiredRoles.length > 0) {
    const hasRequiredRole = hasAnyRole(requiredRoles);
    if (!hasRequiredRole) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="min-h-screen flex items-center justify-center bg-gray-50"
        >
          <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
            <div className="w-16 h-16 bg-error-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-error-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-6">
              You don't have the required role to access this page.
              {requiredRoles.length === 1 
                ? ` Required role: ${requiredRoles[0]}`
                : ` Required roles: ${requiredRoles.join(', ')}`
              }
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Your current role: <span className="font-medium">{user?.role}</span>
            </p>
            <button
              onClick={() => window.history.back()}
              className="btn-primary"
            >
              Go Back
            </button>
          </div>
        </motion.div>
      );
    }
  }

  // Check permission requirements
  if (requiredPermissions.length > 0) {
    const hasRequiredPermission = hasAnyPermission(requiredPermissions);
    if (!hasRequiredPermission) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="min-h-screen flex items-center justify-center bg-gray-50"
        >
          <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
            <div className="w-16 h-16 bg-warning-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Permission Required</h2>
            <p className="text-gray-600 mb-6">
              You don't have the required permissions to access this page.
              {requiredPermissions.length === 1 
                ? ` Required permission: ${requiredPermissions[0]}`
                : ` Required permissions: ${requiredPermissions.join(', ')}`
              }
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Your role: <span className="font-medium">{user?.role}</span>
            </p>
            <button
              onClick={() => window.history.back()}
              className="btn-primary"
            >
              Go Back
            </button>
          </div>
        </motion.div>
      );
    }
  }

  // User is authenticated and has required roles/permissions
  return <>{children}</>;
};

export default ProtectedRoute;
