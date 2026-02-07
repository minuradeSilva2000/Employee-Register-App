import React from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiEdit2, FiMail, FiPhone, FiMapPin, FiBriefcase, FiCalendar, FiDollarSign } from 'react-icons/fi';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const EmployeeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Placeholder data - in real app, this would be fetched from API
  const employee = {
    _id: id,
    fullName: 'John Smith',
    employeeId: 'EMP000001',
    email: 'john.smith@example.com',
    phone: '+1-555-0101',
    address: '123 Main St, New York, NY 10001',
    department: { name: 'Engineering' },
    jobTitle: { title: 'Software Engineer' },
    salary: 75000,
    dateJoined: '2022-01-15',
    status: 'Active',
    NIC: '123456789V',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/employees')}
            className="mr-4 text-gray-600 hover:text-gray-900"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Employee Details</h1>
            <p className="text-gray-600 mt-1">View and manage employee information</p>
          </div>
        </div>
        <button className="btn-primary">
          <FiEdit2 className="w-4 h-4 mr-2" />
          Edit Employee
        </button>
      </div>

      {/* Employee Info Card */}
      <div className="card">
        <div className="p-6">
          <div className="flex items-start space-x-6">
            <div className="w-24 h-24 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-gray-600">
                {employee.fullName.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900">{employee.fullName}</h2>
              <p className="text-gray-600">{employee.jobTitle?.title}</p>
              <div className="mt-4 flex items-center space-x-4">
                <span
                  className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                    employee.status === 'Active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {employee.status}
                </span>
                <span className="text-sm text-gray-500">
                  Employee ID: {employee.employeeId}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
          </div>
          <div className="card-body space-y-4">
            <div className="flex items-center">
              <FiMail className="w-5 h-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="text-gray-900">{employee.email}</p>
              </div>
            </div>
            <div className="flex items-center">
              <FiPhone className="w-5 h-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="text-gray-900">{employee.phone}</p>
              </div>
            </div>
            <div className="flex items-center">
              <FiMapPin className="w-5 h-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Address</p>
                <p className="text-gray-900">{employee.address}</p>
              </div>
            </div>
            <div className="flex items-center">
              <FiCalendar className="w-5 h-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-500">NIC</p>
                <p className="text-gray-900">{employee.NIC}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Employment Information */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">Employment Information</h3>
          </div>
          <div className="card-body space-y-4">
            <div className="flex items-center">
              <FiBriefcase className="w-5 h-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Department</p>
                <p className="text-gray-900">{employee.department?.name}</p>
              </div>
            </div>
            <div className="flex items-center">
              <FiBriefcase className="w-5 h-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Job Title</p>
                <p className="text-gray-900">{employee.jobTitle?.title}</p>
              </div>
            </div>
            <div className="flex items-center">
              <FiDollarSign className="w-5 h-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Salary</p>
                <p className="text-gray-900">${employee.salary.toLocaleString()}</p>
              </div>
            </div>
            <div className="flex items-center">
              <FiCalendar className="w-5 h-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Date Joined</p>
                <p className="text-gray-900">{new Date(employee.dateJoined).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default EmployeeDetail;
