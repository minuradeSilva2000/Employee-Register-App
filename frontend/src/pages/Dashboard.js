import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FiUsers,
  FiBriefcase,
  FiCalendar,
  FiTrendingUp,
  FiDollarSign,
  FiActivity,
  FiUserCheck,
  FiUserX,
  FiUser,
  FiMoreHorizontal,
} from 'react-icons/fi';
import { dashboardAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
} from 'recharts';

// Animation variants
const containerVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};

const cardVariants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.4 },
};

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const Dashboard = () => {
  const { user } = useAuth();
  const [overview, setOverview] = useState(null);
  const [paymentOverview, setPaymentOverview] = useState(null);
  const [attendanceAnalytics, setAttendanceAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [overviewRes, paymentRes, attendanceRes] = await Promise.all([
        dashboardAPI.getOverview(),
        dashboardAPI.getPaymentOverview(),
        dashboardAPI.getAttendanceAnalytics(),
      ]);

      if (overviewRes.success) {
        setOverview(overviewRes.data.overview);
      }
      if (paymentRes.success) {
        setPaymentOverview(paymentRes.data.paymentOverview);
      }
      if (attendanceRes.success) {
        setAttendanceAnalytics(attendanceRes.data.attendanceAnalytics);
      }
    } catch (error) {
      setError('Failed to load dashboard data');
      console.error('Dashboard error:', error);
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

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-error-600 mb-4">{error}</div>
        <button onClick={fetchDashboardData} className="btn-primary">
          Try Again
        </button>
      </div>
    );
  }

  if (!overview) {
    return <div>No data available</div>;
  }

  // Stat Cards
  const statCards = [
    {
      title: 'Total Employees',
      value: overview.employees.total,
      change: '+12%',
      changeType: 'positive',
      icon: FiUsers,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Active Employees',
      value: overview.employees.active,
      change: '+8%',
      changeType: 'positive',
      icon: FiUserCheck,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Departments',
      value: overview.departments.total,
      change: '+2',
      changeType: 'positive',
      icon: FiBriefcase,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Attendance Rate',
      value: `${overview.attendance.attendanceRate}%`,
      change: '+5%',
      changeType: 'positive',
      icon: FiActivity,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className="space-y-6"
    >
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back, {user?.name}! Here's what's happening with your team today.
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Last updated</p>
          <p className="text-sm font-medium text-gray-900">
            {new Date().toLocaleString()}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            variants={cardVariants}
            initial="initial"
            animate="animate"
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02, y: -2 }}
            className="card hover:shadow-medium transition-all duration-200"
          >
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  <div className="flex items-center mt-2">
                    <FiTrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600 font-medium">{stat.change}</span>
                    <span className="text-sm text-gray-500 ml-1">from last month</span>
                  </div>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`w-6 h-6 bg-gradient-to-r ${stat.color} text-transparent bg-clip-text`} />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Distribution */}
        <motion.div
          variants={cardVariants}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.4 }}
          className="card"
        >
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Department Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={overview.departmentDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="employeeCount"
                >
                  {overview.departmentDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Monthly Trend */}
        <motion.div
          variants={cardVariants}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.5 }}
          className="card"
        >
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={overview.monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="newHires"
                  stackId="1"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.6}
                />
                <Area
                  type="monotone"
                  dataKey="attendanceRecords"
                  stackId="2"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Salary Overview */}
      {paymentOverview && (
        <motion.div
          variants={cardVariants}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.6 }}
          className="card"
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Salary Overview</h3>
              <div className="flex items-center text-2xl font-bold text-gray-900">
                <FiDollarSign className="w-6 h-6 mr-1" />
                {paymentOverview.monthlySalaryCost.toLocaleString()}
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-600 mb-3">Department Breakdown</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={paymentOverview.departmentSalaryBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="departmentName" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="totalSalary" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-600 mb-3">Salary Distribution</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={paymentOverview.salaryDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Recent Employees */}
      <motion.div
        variants={cardVariants}
        initial="initial"
        animate="animate"
        transition={{ delay: 0.7 }}
        className="card"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Employees</h3>
            <button className="text-primary-600 hover:text-primary-800 text-sm font-medium">
              View All
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {overview.recentEmployees.map((employee) => (
                  <tr key={employee._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                          <FiUser className="w-4 h-4 text-gray-600" />
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {employee.department?.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {employee.jobTitle?.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button className="text-primary-600 hover:text-primary-900">
                        <FiMoreHorizontal className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;
