/**
 * Role-Based Route Component
 * Protects routes based on user roles
 */

import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../ui/LoadingSpinner';

interface RoleRouteProps {
  children: ReactNode;
  requiredRoles: string[];
  fallbackPath?: string;
}

const RoleRoute: React.FC<RoleRouteProps> = ({ 
  children, 
  requiredRoles, 
  fallbackPath = '/unauthorized' 
}) => {
  const { isAuthenticated, isLoading, hasAnyRole } = useAuth();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has required role(s)
  const hasRequiredRole = hasAnyRole(requiredRoles);

  // Redirect to unauthorized page if user doesn't have required role
  if (!hasRequiredRole) {
    return <Navigate to={fallbackPath} replace />;
  }

  // Render children if all checks pass
  return <>{children}</>;
};

export default RoleRoute;
