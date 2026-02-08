import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

/**
 * Custom hook for authentication guards
 * Provides utilities for protecting routes and actions
 */
export const useAuthGuard = () => {
  const { isAuthenticated, user, hasAnyRole, hasAnyPermission } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  /**
   * Check if user is authenticated and redirect to login if not
   * @param {string} redirectTo - Path to redirect to after login
   * @param {string} message - Custom message to show
   */
  const requireAuth = (redirectTo = null, message = 'Login required to access this feature.') => {
    if (!isAuthenticated) {
      toast.error(message, {
        duration: 4000,
        icon: '🔒',
        style: {
          background: '#ef4444',
          color: '#fff',
        },
      });
      
      navigate('/login', { 
        state: { from: redirectTo || location.pathname },
        replace: true 
      });
      return false;
    }
    return true;
  };

  /**
   * Check if user has required roles
   * @param {string[]} roles - Required roles
   * @param {string} message - Custom message to show
   */
  const requireRoles = (roles, message = null) => {
    if (!isAuthenticated) {
      return requireAuth();
    }

    if (!hasAnyRole(roles)) {
      const defaultMessage = `Access denied. Required role: ${roles.join(' or ')}.`;
      toast.error(message || defaultMessage, {
        duration: 4000,
        icon: '⛔',
        style: {
          background: '#f59e0b',
          color: '#fff',
        },
      });
      return false;
    }
    return true;
  };

  /**
   * Check if user has required permissions
   * @param {string[]} permissions - Required permissions
   * @param {string} message - Custom message to show
   */
  const requirePermissions = (permissions, message = null) => {
    if (!isAuthenticated) {
      return requireAuth();
    }

    if (!hasAnyPermission(permissions)) {
      const defaultMessage = `Access denied. Required permission: ${permissions.join(' or ')}.`;
      toast.error(message || defaultMessage, {
        duration: 4000,
        icon: '⛔',
        style: {
          background: '#f59e0b',
          color: '#fff',
        },
      });
      return false;
    }
    return true;
  };

  /**
   * Protected navigation function
   * @param {string} path - Path to navigate to
   * @param {string[]} requiredRoles - Required roles for navigation
   * @param {string[]} requiredPermissions - Required permissions for navigation
   */
  const protectedNavigate = (path, requiredRoles = [], requiredPermissions = []) => {
    // Check authentication first
    if (!requireAuth(path)) {
      return;
    }

    // Check roles if specified
    if (requiredRoles.length > 0 && !requireRoles(requiredRoles)) {
      return;
    }

    // Check permissions if specified
    if (requiredPermissions.length > 0 && !requirePermissions(requiredPermissions)) {
      return;
    }

    // Navigate if all checks pass
    navigate(path);
  };

  /**
   * Protected action executor
   * @param {Function} action - Action to execute
   * @param {string[]} requiredRoles - Required roles for action
   * @param {string[]} requiredPermissions - Required permissions for action
   */
  const protectedAction = (action, requiredRoles = [], requiredPermissions = []) => {
    // Check authentication first
    if (!requireAuth()) {
      return;
    }

    // Check roles if specified
    if (requiredRoles.length > 0 && !requireRoles(requiredRoles)) {
      return;
    }

    // Check permissions if specified
    if (requiredPermissions.length > 0 && !requirePermissions(requiredPermissions)) {
      return;
    }

    // Execute action if all checks pass
    if (typeof action === 'function') {
      action();
    }
  };

  /**
   * Check if current user can access a feature
   * @param {string[]} requiredRoles - Required roles
   * @param {string[]} requiredPermissions - Required permissions
   */
  const canAccess = (requiredRoles = [], requiredPermissions = []) => {
    if (!isAuthenticated) {
      return false;
    }

    if (requiredRoles.length > 0 && !hasAnyRole(requiredRoles)) {
      return false;
    }

    if (requiredPermissions.length > 0 && !hasAnyPermission(requiredPermissions)) {
      return false;
    }

    return true;
  };

  return {
    isAuthenticated,
    user,
    requireAuth,
    requireRoles,
    requirePermissions,
    protectedNavigate,
    protectedAction,
    canAccess,
  };
};

export default useAuthGuard;