import React from 'react';
import { motion } from 'framer-motion';
import { FiAlertCircle, FiCheckCircle, FiMail, FiLock, FiUser, FiPhone, FiCalendar, FiMapPin, FiBriefcase } from 'react-icons/fi';
import { useField } from 'formik';

/**
 * Enhanced FormField Component - Reusable form field with validation
 * 
 * Features:
 * - Multiple input types (text, email, password, select, textarea, checkbox, radio)
 * - Real-time validation feedback
 * - Error handling and display
 * - Accessibility support
 * - Animated transitions
 */
const FormField = ({
  label,
  name,
  type = 'text',
  placeholder = '',
  required = false,
  disabled = false,
  options = [],
  rows = 4,
  helpText = '',
  className = '',
  autoComplete = 'off',
  ...props
}) => {
  const [field, meta] = useField(name);
  const hasError = meta.touched && meta.error;
  const isValid = meta.touched && !meta.error;

  // Icon mapping for different input types
  const getIconForType = (inputType) => {
    const iconMap = {
      email: FiMail,
      password: FiLock,
      text: FiUser,
      phone: FiPhone,
      date: FiCalendar,
      address: FiMapPin,
      jobTitle: FiBriefcase,
    };
    return iconMap[inputType] || null;
  };

  const icon = getIconForType(type);
  const baseClasses = `
    block w-full px-3 py-2 border rounded-md shadow-sm
    placeholder-gray-400
    focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
    sm:text-sm transition-colors duration-200
    ${disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : 'bg-white text-gray-900'}
    ${hasError ? 'border-error-500 focus:ring-error-500 focus:border-error-500' : 'border-gray-300'}
    ${isValid ? 'border-success-500 focus:ring-success-500 focus:border-success-500' : ''}
    ${icon ? 'pl-10' : ''}
    ${className}
  `;

  // Render different input types
  const renderInput = () => {
    switch (type) {
      case 'textarea':
        return (
          <textarea
            {...field}
            {...props}
            placeholder={placeholder}
            disabled={disabled}
            rows={rows}
            className={baseClasses}
            autoComplete={autoComplete}
          />
        );
      
      case 'select':
        return (
          <select
            {...field}
            {...props}
            disabled={disabled}
            className={baseClasses}
          >
            <option value="">{placeholder || `Select ${label}`}</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      
      case 'checkbox':
        return (
          <div className="flex items-center">
            <input
              type="checkbox"
              {...field}
              {...props}
              disabled={disabled}
              className="form-checkbox h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label className="ml-2 text-sm text-gray-700">
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </label>
          </div>
        );
      
      case 'radio':
        return (
          <div className="space-y-2">
            {options.map((option) => (
              <div key={option.value} className="flex items-center">
                <input
                  type="radio"
                  {...field}
                  {...props}
                  value={option.value}
                  disabled={disabled}
                  className="form-radio h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                />
                <label className="ml-2 text-sm text-gray-700">
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        );
      
      case 'password':
        return (
          <div className="relative">
            {icon && (
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                {React.createElement(icon, { className: "h-5 w-5 text-gray-400" })}
              </div>
            )}
            <input
              type="password"
              {...field}
              {...props}
              placeholder={placeholder}
              disabled={disabled}
              className={baseClasses}
              autoComplete={autoComplete}
            />
          </div>
        );
      
      default:
        return (
          <div className="relative">
            {icon && (
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                {React.createElement(icon, { className: "h-5 w-5 text-gray-400" })}
              </div>
            )}
            <input
              type={type}
              {...field}
              {...props}
              placeholder={placeholder}
              disabled={disabled}
              className={baseClasses}
              autoComplete={autoComplete}
            />
          </div>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={className}
    >
      {/* Label */}
      {type !== 'checkbox' && type !== 'radio' && label && (
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Input Field */}
      <div className="relative">
        {renderInput()}
        
        {/* Validation Icon */}
        {type !== 'checkbox' && type !== 'radio' && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            {hasError && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <FiAlertCircle className="h-5 w-5 text-error-500" />
              </motion.div>
            )}
            {isValid && !disabled && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <FiCheckCircle className="h-5 w-5 text-success-500" />
              </motion.div>
            )}
          </div>
        )}
      </div>

      {/* Error Message */}
      {hasError && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="mt-1 text-sm text-error-600"
        >
          {meta.error}
        </motion.p>
      )}

      {/* Help Text */}
      {helpText && !hasError && (
        <p className="mt-1 text-sm text-gray-500">
          {helpText}
        </p>
      )}
    </motion.div>
  );
};

export default FormField;
