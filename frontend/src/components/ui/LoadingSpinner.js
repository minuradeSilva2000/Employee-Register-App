import React from 'react';
import { motion } from 'framer-motion';

const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'spinner-sm',
    md: 'spinner-md',
    lg: 'spinner-lg',
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`inline-flex items-center justify-center ${className}`}
    >
      <div className={`${sizeClasses[size]}`} />
    </motion.div>
  );
};

export default LoadingSpinner;
