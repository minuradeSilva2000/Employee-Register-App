import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiCalendar, FiClock, FiCheckCircle, FiXCircle, FiAlertCircle } from 'react-icons/fi';
import { attendanceAPI } from '../../services/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const Attendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const response = await attendanceAPI.getAll();
      if (response.success) {
        setAttendance(response.data.attendance);
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Present':
        return <FiCheckCircle className="w-5 h-5 text-green-600" />;
      case 'Absent':
        return <FiXCircle className="w-5 h-5 text-red-600" />;
      case 'Half Day':
        return <FiAlertCircle className="w-5 h-5 text-yellow-600" />;
      default:
        return <FiClock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Present':
        return 'bg-green-100 text-green-800';
      case 'Absent':
        return 'bg-red-100 text-red-800';
      case 'Half Day':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
          <h1 className="text-3xl font-bold text-gray-900">Attendance</h1>
          <p className="text-gray-600 mt-1">Track employee attendance and time records</p>
        </div>
        <button className="btn-primary">
          <FiPlus className="w-4 h-4 mr-2" />
          Mark Attendance
        </button>
      </div>

      <div className="card">
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="table">
              <thead className="table-header">
                <tr>
                  <th className="table-header-cell">Employee</th>
                  <th className="table-header-cell">Date</th>
                  <th className="table-header-cell">Check In</th>
                  <th className="table-header-cell">Check Out</th>
                  <th className="table-header-cell">Status</th>
                  <th className="table-header-cell">Actions</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {attendance.map((record) => (
                  <motion.tr
                    key={record._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="table-row"
                  >
                    <td className="table-cell">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                          <span className="text-gray-600 font-medium text-xs">
                            {record.employeeId?.fullName?.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {record.employeeId?.fullName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {record.employeeId?.employeeId}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">
                      {new Date(record.date).toLocaleDateString()}
                    </td>
                    <td className="table-cell">
                      {record.checkInTime ? new Date(record.checkInTime).toLocaleTimeString() : '-'}
                    </td>
                    <td className="table-cell">
                      {record.checkOutTime ? new Date(record.checkOutTime).toLocaleTimeString() : '-'}
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center">
                        {getStatusIcon(record.status)}
                        <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(record.status)}`}>
                          {record.status}
                        </span>
                      </div>
                    </td>
                    <td className="table-cell">
                      <button className="text-primary-600 hover:text-primary-900">
                        <FiCalendar className="w-4 h-4" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Attendance;
