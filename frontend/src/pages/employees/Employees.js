import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiSearch, FiFilter, FiDownload, FiEdit2, FiTrash2, FiEye } from 'react-icons/fi';
import { employeeAPI } from '../../services/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await employeeAPI.getAll();
      if (response.success) {
        setEmployees(response.data.employees);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Employees</h1>
          <p className="text-gray-600 mt-1">Manage your team members and their information</p>
        </div>
        <button className="btn-primary">
          <FiPlus className="w-4 h-4 mr-2" />
          Add Employee
        </button>
      </div>

      {/* Search and Filters */}
      <div className="card">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input pl-10"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="form-select sm:w-48"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="resigned">Resigned</option>
            </select>
            <button className="btn-outline">
              <FiFilter className="w-4 h-4 mr-2" />
              More Filters
            </button>
            <button className="btn-outline">
              <FiDownload className="w-4 h-4 mr-2" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Employees Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="table">
            <thead className="table-header">
              <tr>
                <th className="table-header-cell">Employee</th>
                <th className="table-header-cell">Department</th>
                <th className="table-header-cell">Job Title</th>
                <th className="table-header-cell">Status</th>
                <th className="table-header-cell">Salary</th>
                <th className="table-header-cell">Actions</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {employees.map((employee) => (
                <motion.tr
                  key={employee._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="table-row"
                >
                  <td className="table-cell">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                        <span className="text-gray-600 font-medium">
                          {employee.fullName.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {employee.fullName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {employee.employeeId}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="table-cell">
                    {employee.department?.name}
                  </td>
                  <td className="table-cell">
                    {employee.jobTitle?.title}
                  </td>
                  <td className="table-cell">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        employee.status === 'Active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {employee.status}
                    </span>
                  </td>
                  <td className="table-cell">
                    ${employee.salary?.toLocaleString()}
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center space-x-2">
                      <button className="text-primary-600 hover:text-primary-900">
                        <FiEye className="w-4 h-4" />
                      </button>
                      <button className="text-gray-600 hover:text-gray-900">
                        <FiEdit2 className="w-4 h-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

export default Employees;
