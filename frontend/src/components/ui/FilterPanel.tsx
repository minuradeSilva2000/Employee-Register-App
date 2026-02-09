/**
 * FilterPanel Component
 * Advanced filtering UI for employees
 */

import React from 'react';
import { motion } from 'framer-motion';
import { FiFilter, FiX } from 'react-icons/fi';
import { Department, EmployeeStatus, EmployeeFilters } from '../../models/Employee.model';

interface FilterPanelProps {
  filters: EmployeeFilters;
  onFilterChange: (filters: EmployeeFilters) => void;
  onClear: () => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ filters, onFilterChange, onClear }) => {
  const handleDepartmentChange = (department: Department | '') => {
    onFilterChange({
      ...filters,
      department: department || undefined
    });
  };

  const handleStatusChange = (status: EmployeeStatus | '') => {
    onFilterChange({
      ...filters,
      status: status || undefined
    });
  };

  const hasActiveFilters = filters.department || filters.status;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-md p-4 mb-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <FiFilter className="w-5 h-5 text-gray-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={onClear}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center"
          >
            <FiX className="w-4 h-4 mr-1" />
            Clear All
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Department Filter */}
        <div>
          <label htmlFor="department-filter" className="block text-sm font-medium text-gray-700 mb-1">
            Department
          </label>
          <select
            id="department-filter"
            value={filters.department || ''}
            onChange={(e) => handleDepartmentChange(e.target.value as Department | '')}
            className="form-input"
          >
            <option value="">All Departments</option>
            {Object.values(Department).map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            id="status-filter"
            value={filters.status || ''}
            onChange={(e) => handleStatusChange(e.target.value as EmployeeStatus | '')}
            className="form-input"
          >
            <option value="">All Statuses</option>
            {Object.values(EmployeeStatus).map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="mt-4 flex flex-wrap gap-2">
          {filters.department && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              {filters.department}
              <button
                onClick={() => handleDepartmentChange('')}
                className="ml-2 hover:text-blue-900"
              >
                <FiX className="w-4 h-4" />
              </button>
            </span>
          )}
          {filters.status && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
              {filters.status}
              <button
                onClick={() => handleStatusChange('')}
                className="ml-2 hover:text-green-900"
              >
                <FiX className="w-4 h-4" />
              </button>
            </span>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default FilterPanel;
