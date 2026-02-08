import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const QuickActionButton = ({ 
  icon: Icon, 
  title, 
  description, 
  color, 
  route, 
  requiredRoles = [],
  index = 0,
  className = '',
  onClick = null 
}) => {
  const navigate = useNavigate();
  const { isAuthenticated, hasAnyRole } = useAuth();

  const handleClick = () => {
    // If custom onClick is provided, use it
    if (onClick) {
      onClick();
      return;
    }

    // Check authentication first
    if (!isAuthenticated) {
      toast.error('Login required to access this feature.', {
        duration: 4000,
        icon: '🔒',
        style: {
          background: '#ef4444',
          color: '#fff',
        },
      });
      return;
    }

    // Check role requirements if specified
    if (requiredRoles.length > 0) {
      const hasRequiredRole = hasAnyRole(requiredRoles);
      if (!hasRequiredRole) {
        toast.error(`Access denied. Required role: ${requiredRoles.join(' or ')}.`, {
          duration: 4000,
          icon: '⛔',
          style: {
            background: '#f59e0b',
            color: '#fff',
          },
        });
        return;
      }
    }

    // Navigate to the route if all checks pass
    if (route) {
      navigate(route);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.4, 
        ease: 'easeOut', 
        delay: index * 0.1 
      }}
      whileHover={{ scale: 1.02, x: 10 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
      className={`flex items-center space-x-4 p-4 bg-white/10 backdrop-blur-sm rounded-xl cursor-pointer hover:bg-white/20 transition-all duration-200 ${className}`}
    >
      <div className={`p-3 rounded-lg bg-gradient-to-r ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="flex-1">
        <h4 className="font-semibold text-white">{title}</h4>
        <p className="text-primary-100 text-sm">{description}</p>
        {!isAuthenticated && requiredRoles.length > 0 && (
          <p className="text-yellow-200 text-xs mt-1">🔒 Login required</p>
        )}
        {isAuthenticated && requiredRoles.length > 0 && !hasAnyRole(requiredRoles) && (
          <p className="text-orange-200 text-xs mt-1">⛔ Role required: {requiredRoles.join(' or ')}</p>
        )}
      </div>
    </motion.div>
  );
};

export default QuickActionButton;