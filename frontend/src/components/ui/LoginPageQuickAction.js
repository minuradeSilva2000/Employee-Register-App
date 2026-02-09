import React from 'react';
import { motion } from 'framer-motion';

/**
 * Login Page Quick Action Component
 * Non-interactive display component for the login page
 * Does NOT perform authentication checks or block login
 */
const LoginPageQuickAction = ({ 
  icon: Icon, 
  title, 
  description, 
  color, 
  index = 0,
  className = ''
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.4, 
        ease: 'easeOut', 
        delay: index * 0.1 
      }}
      className={`flex items-center space-x-4 p-4 bg-white/10 backdrop-blur-sm rounded-xl transition-all duration-200 ${className}`}
    >
      <div className={`p-3 rounded-lg bg-gradient-to-r ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="flex-1">
        <h4 className="font-semibold text-white">{title}</h4>
        <p className="text-primary-100 text-sm">{description}</p>
      </div>
    </motion.div>
  );
};

export default LoginPageQuickAction;