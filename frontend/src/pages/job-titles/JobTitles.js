import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiBriefcase } from 'react-icons/fi';
import { jobTitleAPI } from '../../services/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const JobTitles = () => {
  const [jobTitles, setJobTitles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobTitles();
  }, []);

  const fetchJobTitles = async () => {
    try {
      setLoading(true);
      const response = await jobTitleAPI.getAll({ includeEmployeeCount: true });
      if (response.success) {
        setJobTitles(response.data.jobTitles);
      }
    } catch (error) {
      console.error('Error fetching job titles:', error);
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Job Titles</h1>
          <p className="text-gray-600 mt-1">Manage job positions and roles</p>
        </div>
        <button className="btn-primary">
          <FiPlus className="w-4 h-4 mr-2" />
          Add Job Title
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobTitles.map((jobTitle) => (
          <motion.div
            key={jobTitle._id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="card hover:shadow-medium transition-all duration-200"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{jobTitle.title}</h3>
                <div className="flex items-center space-x-2">
                  <button className="text-gray-600 hover:text-gray-900">
                    <FiEdit2 className="w-4 h-4" />
                  </button>
                  <button className="text-red-600 hover:text-red-900">
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-4">{jobTitle.description}</p>
              <div className="flex items-center text-primary-600">
                <FiBriefcase className="w-4 h-4 mr-2" />
                <span className="text-sm font-medium">
                  {jobTitle.employeeCount || 0} employees
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default JobTitles;
