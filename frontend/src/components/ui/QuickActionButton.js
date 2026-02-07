import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

/**
 * QuickActionButton Component
 * 
 * A reusable button for quick navigation actions with role-based access control
 * 
 * @param {Object} props - Component props
 * @param {string} props.title - Button title
 * @param {string} props.description - Button description
 * @param {React.ComponentType} props.icon - Icon component
 * @param {string} props.route - Target route for navigation
 * @param {string[]} props.roleAccess - Array of roles that can access this action
 * @param {string} props.color - Gradient color classes
 * @param {Function} props.onClick - Optional custom click handler
 * @param {boolean} props.disabled - Whether button is disabled
 * @param {string} props.size - Button size ('sm', 'md', 'lg')
 */
const QuickActionButton = ({
  title,
  description,
  icon: Icon,
  route,
  roleAccess = ['Admin', 'HR', 'Viewer'],
  color = 'from-blue-500 to-blue-600',
  onClick,
  disabled = false,
  size = 'md'
}) => {
  const navigate = useNavigate();
  const { user, hasAnyRole } = useAuth();

  // Size configurations
  const sizeClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  };

  // Icon size configurations
  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  // Check if user has access to this action
  const hasAccess = hasAnyRole(roleAccess);

  const handleClick = () => {
    if (disabled || !hasAccess) {
      if (!hasAccess) {
        toast.error(`Access denied: ${roleAccess.join(' or ')} role required`, {
          icon: '🔒',
          duration: 3000,
        });
      }
      return;
    }

    if (onClick) {
      onClick();
      return;
    }

    if (route) {
      // Navigate with smooth transition
      navigate(route);
      toast.success(`Navigating to ${title}`, {
        icon: '🚀',
        duration: 2000,
      });
    }
  };

  // Animation variants
  const buttonVariants = {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    hover: { scale: 1.02, x: 5 },
    tap: { scale: 0.98 },
    disabled: { opacity: 0.5, cursor: 'not-allowed' }
  };

  return (
    <motion.div
      variants={buttonVariants}
      initial="initial"
      animate="animate"
      whileHover={disabled ? "disabled" : "hover"}
      whileTap={disabled ? "disabled" : "tap"}
      onClick={handleClick}
      className={`
        flex items-center space-x-4 ${sizeClasses[size]} 
        bg-white/10 backdrop-blur-sm rounded-xl 
        cursor-pointer transition-all duration-200
        ${disabled ? 'cursor-not-allowed opacity-50' : 'hover:bg-white/20'}
        ${!hasAccess ? 'opacity-60' : ''}
      `}
      title={!hasAccess ? `Requires ${roleAccess.join(' or ')} role` : title}
    >
      {/* Icon */}
      <div className={`p-2 rounded-lg bg-gradient-to-r ${color}`}>
        <Icon className={`${iconSizes[size]} text-white`} />
      </div>
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-white truncate">{title}</h4>
        <p className="text-primary-100 text-sm truncate">{description}</p>
      </div>

      {/* Access indicator */}
      {!hasAccess && (
        <div className="flex-shrink-0">
          <svg className="w-4 h-4 text-warning-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
      )}
    </motion.div>
  );
};

export default QuickActionButton;
