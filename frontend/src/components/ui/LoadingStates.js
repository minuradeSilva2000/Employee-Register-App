import React from 'react';
import { motion } from 'framer-motion';
import { FiLoader, FiRefreshCw } from 'react-icons/fi';

/**
 * LoadingSpinner - Enhanced loading component with multiple variants
 */
export const LoadingSpinner = ({ 
  size = 'md', 
  color = 'primary', 
  text = 'Loading...', 
  showText = true,
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const colorClasses = {
    primary: 'text-primary-600',
    secondary: 'text-gray-600',
    success: 'text-success-600',
    warning: 'text-warning-600',
    error: 'text-error-600',
    white: 'text-white'
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: 'infinite', ease: 'linear' }}
        className={`${sizeClasses[size]} ${colorClasses[color]}`}
      >
        <FiLoader className="w-full h-full" />
      </motion.div>
      {showText && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`mt-2 text-sm ${
            color === 'white' ? 'text-white' : 'text-gray-600'
          }`}
        >
          {text}
        </motion.p>
      )}
    </div>
  );
};

/**
 * SkeletonLoader - Content placeholder for loading states
 */
export const SkeletonLoader = ({ 
  lines = 3, 
  className = '' 
}) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: index * 0.1 }}
          className="skeleton"
        >
          <div className="h-4 bg-gray-200 rounded w-full"></div>
        </motion.div>
      ))}
    </div>
  );
};

/**
 * TableSkeleton - Table loading placeholder
 */
export const TableSkeleton = ({ 
  rows = 5, 
  columns = 4 
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {Array.from({ length: columns }).map((_, index) => (
              <th key={index} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr key={rowIndex}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <td key={colIndex} className="px-6 py-4 whitespace-nowrap">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

/**
 * CardSkeleton - Card loading placeholder
 */
export const CardSkeleton = ({ 
  showAvatar = true,
  showText = true,
  lines = 3 
}) => {
  return (
    <div className="card">
      <div className="p-6">
        <div className="flex items-start space-x-4">
          {showAvatar && (
            <div className="skeleton-avatar"></div>
          )}
          <div className="flex-1 min-w-0">
            {showText && (
              <>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <SkeletonLoader lines={lines - 1} />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * PageLoader - Full page loading overlay
 */
export const PageLoader = ({ 
  text = 'Loading...', 
  showLogo = true 
}) => {
  return (
    <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="text-center"
      >
        {showLogo && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <FiLoader className="w-8 h-8 text-white" />
          </motion.div>
        )}
        
        <LoadingSpinner size="lg" text={text} />
      </motion.div>
    </div>
  );
};

/**
 * InlineLoader - Small inline loading indicator
 */
export const InlineLoader = ({ 
  size = 'sm', 
  text = 'Loading...',
  position = 'left' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <div className={`flex items-center space-x-2 ${position === 'right' ? 'flex-row-reverse' : ''}`}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: 'infinite', ease: 'linear' }}
        className={`${sizeClasses[size]} text-primary-600`}
      >
        <FiRefreshCw className="w-full h-full" />
      </motion.div>
      {text && (
        <span className="text-sm text-gray-600">{text}</span>
      )}
    </div>
  );
};

/**
 * ProgressLoader - Progress indicator with percentage
 */
export const ProgressLoader = ({ 
  progress = 0, 
  text = 'Loading...', 
  showPercentage = true 
}) => {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-600">{text}</span>
        {showPercentage && (
          <span className="text-sm font-medium text-gray-900">{progress}%</span>
        )}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <motion.div
          className="bg-primary-600 h-2 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
};

/**
 * EmptyState - Empty state illustration
 */
export const EmptyState = ({ 
  icon: Icon = FiLoader,
  title = 'No data available',
  description = 'There are no items to display at the moment.',
  action = null 
}) => {
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Icon className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 mb-6 max-w-md mx-auto">{description}</p>
      {action && (
        <div className="flex justify-center">
          {action}
        </div>
      )}
    </div>
  );
};

export default LoadingSpinner;
