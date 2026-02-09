/**
 * EmployeeModal Component
 * Dynamic modal that adapts based on action type
 * Handles Add, Update, Delete, Search, and Filter actions
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX } from 'react-icons/fi';
import { Employee, EmployeeFormData, Department, EmployeeStatus, EmployeeFormErrors } from '../../models/Employee.model';
import { QuickActionType, QuickActionPayload } from '../../models/QuickAction.model';
import { validateEmployeeForm, hasFormErrors, formatDateForInput } from '../../utils/validation';
import LoadingSpinner from '../ui/LoadingSpinner';

interface EmployeeModalProps {
  isOpen: boolean;
  actionType: QuickActionType;
  employee?: Employee;
  onClose: () => void;
  onSubmit: (payload: QuickActionPayload) => Promise<void>;
}

const EmployeeModal: React.FC<EmployeeModalProps> = ({
  isOpen,
  actionType,
  employee,
  onClose,
  onSubmit
}) => {
  const [formData, setFormData] = useState<EmployeeFormData>({
    fullName: '',
    email: '',
    phone: '',
    department: '',
    position: '',
    salary: '',
    dateJoined: '',
    status: '',
    address: ''
  });
  const [errors, setErrors] = useState<EmployeeFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form data when employee changes
  useEffect(() => {
    if (employee && (actionType === QuickActionType.UPDATE_EMPLOYEE)) {
      setFormData({
        fullName: employee.fullName,
        email: employee.email,
        phone: employee.phone,
        department: employee.department,
        position: employee.position,
        salary: employee.salary.toString(),
        dateJoined: formatDateForInput(employee.dateJoined),
        status: employee.status,
        address: employee.address || ''
      });
    } else {
      // Reset form for add action
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        department: '',
        position: '',
        salary: '',
        dateJoined: '',
        status: '',
        address: ''
      });
    }
    setErrors({});
  }, [employee, actionType]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    if (errors[name as keyof EmployeeFormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const validationErrors = validateEmployeeForm(formData);
    if (hasFormErrors(validationErrors)) {
      setErrors(validationErrors);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await onSubmit({
        type: actionType,
        employee,
        data: formData
      });
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getModalTitle = (): string => {
    switch (actionType) {
      case QuickActionType.ADD_EMPLOYEE:
        return 'Add New Employee';
      case QuickActionType.UPDATE_EMPLOYEE:
        return 'Update Employee';
      case QuickActionType.DELETE_EMPLOYEE:
        return 'Delete Employee';
      case QuickActionType.SEARCH_EMPLOYEE:
        return 'Search Employees';
      case QuickActionType.FILTER_EMPLOYEES:
        return 'Filter Employees';
      default:
        return 'Employee Action';
    }
  };

  const renderFormContent = () => {
    // Delete confirmation
    if (actionType === QuickActionType.DELETE_EMPLOYEE && employee) {
      return (
        <div className="text-center py-6">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Are you sure you want to delete this employee?
          </h3>
          <p className="text-gray-600 mb-4">
            <strong>{employee.fullName}</strong> ({employee.email})
          </p>
          <p className="text-sm text-red-600">
            This action cannot be undone.
          </p>
        </div>
      );
    }

    // Add/Update form
    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Full Name */}
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            className={`form-input ${errors.fullName ? 'border-red-500' : ''}`}
            placeholder="Enter full name"
          />
          {errors.fullName && (
            <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
          )}
        </div>

        {/* Email & Phone */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`form-input ${errors.email ? 'border-red-500' : ''}`}
              placeholder="employee@company.com"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Phone <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={`form-input ${errors.phone ? 'border-red-500' : ''}`}
              placeholder="+1-555-0100"
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
            )}
          </div>
        </div>

        {/* Department & Position */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
              Department <span className="text-red-500">*</span>
            </label>
            <select
              id="department"
              name="department"
              value={formData.department}
              onChange={handleChange}
              className={`form-input ${errors.department ? 'border-red-500' : ''}`}
            >
              <option value="">Select Department</option>
              {Object.values(Department).map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
            {errors.department && (
              <p className="mt-1 text-sm text-red-600">{errors.department}</p>
            )}
          </div>

          <div>
            <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-1">
              Position <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="position"
              name="position"
              value={formData.position}
              onChange={handleChange}
              className={`form-input ${errors.position ? 'border-red-500' : ''}`}
              placeholder="e.g., Software Engineer"
            />
            {errors.position && (
              <p className="mt-1 text-sm text-red-600">{errors.position}</p>
            )}
          </div>
        </div>

        {/* Salary & Date Joined */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="salary" className="block text-sm font-medium text-gray-700 mb-1">
              Salary <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="salary"
              name="salary"
              value={formData.salary}
              onChange={handleChange}
              className={`form-input ${errors.salary ? 'border-red-500' : ''}`}
              placeholder="50000"
              min="0"
              step="1000"
            />
            {errors.salary && (
              <p className="mt-1 text-sm text-red-600">{errors.salary}</p>
            )}
          </div>

          <div>
            <label htmlFor="dateJoined" className="block text-sm font-medium text-gray-700 mb-1">
              Date Joined <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              id="dateJoined"
              name="dateJoined"
              value={formData.dateJoined}
              onChange={handleChange}
              className={`form-input ${errors.dateJoined ? 'border-red-500' : ''}`}
            />
            {errors.dateJoined && (
              <p className="mt-1 text-sm text-red-600">{errors.dateJoined}</p>
            )}
          </div>
        </div>

        {/* Status */}
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            Status <span className="text-red-500">*</span>
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            className={`form-input ${errors.status ? 'border-red-500' : ''}`}
          >
            <option value="">Select Status</option>
            {Object.values(EmployeeStatus).map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
          {errors.status && (
            <p className="mt-1 text-sm text-red-600">{errors.status}</p>
          )}
        </div>

        {/* Address */}
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
            Address (Optional)
          </label>
          <textarea
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            rows={3}
            className="form-input"
            placeholder="Enter address"
          />
        </div>
      </form>
    );
  };

  const renderActions = () => {
    if (actionType === QuickActionType.DELETE_EMPLOYEE) {
      return (
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            onClick={() => onSubmit({ type: actionType, employee })}
            disabled={isSubmitting}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <LoadingSpinner size="sm" className="mr-2" />
                Deleting...
              </div>
            ) : (
              'Delete Employee'
            )}
          </button>
        </div>
      );
    }

    return (
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onClose}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {isSubmitting ? (
            <div className="flex items-center">
              <LoadingSpinner size="sm" className="mr-2" />
              {actionType === QuickActionType.UPDATE_EMPLOYEE ? 'Updating...' : 'Adding...'}
            </div>
          ) : (
            actionType === QuickActionType.UPDATE_EMPLOYEE ? 'Update Employee' : 'Add Employee'
          )}
        </button>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="flex min-h-full items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">{getModalTitle()}</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
                disabled={isSubmitting}
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
              {renderFormContent()}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200">
              {renderActions()}
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};

export default EmployeeModal;
