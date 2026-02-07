/**
 * User Dashboard Page
 * For regular users (HR, Viewer roles)
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FiUser,
  FiCalendar,
  FiClock,
  FiBriefcase,
  FiCheckCircle,
  FiAlertCircle,
  FiUsers,
} from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const UserDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalEmployees: 0,
    presentToday: 0,
    pendingRequests: 0,
    upcomingHolidays: 0,
    monthlyAttendance: 85,
    teamSize: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading dashboard data
    const loadDashboardData = async () => {
      try {
        // In a real app, this would be API calls
        await new Promise(resolve => setTimeout(resolve, 800));
        
        setStats({
          totalEmployees: 89,
          presentToday: 76,
          pendingRequests: 3,
          upcomingHolidays: 2,
          monthlyAttendance: 85,
          teamSize: user?.role === 'HR' ? 12 : 8
        });
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user?.role]);

  const statCards = [
    {
      title: 'Total Employees',
      value: stats.totalEmployees,
      icon: FiUsers,
      color: 'from-blue-500 to-blue-600',
      description: 'Active employees'
    },
    {
      title: 'Present Today',
      value: stats.presentToday,
      icon: FiCheckCircle,
      color: 'from-green-500 to-green-600',
      description: `${Math.round((stats.presentToday / stats.totalEmployees) * 100)}% attendance`
    },
    {
      title: 'Pending Requests',
      value: stats.pendingRequests,
      icon: FiAlertCircle,
      color: 'from-orange-500 to-orange-600',
      description: 'Awaiting approval'
    },
    {
      title: 'Team Size',
      value: stats.teamSize,
      icon: FiBriefcase,
      color: 'from-purple-500 to-purple-600',
      description: 'Direct reports'
    }
  ];

  const recentActivities = [
    { title: 'Team Meeting', time: '10:00 AM', type: 'meeting', status: 'upcoming' },
    { title: 'Performance Review', time: '2:00 PM', type: 'review', status: 'upcoming' },
    { title: 'Submit Timesheet', time: '5:00 PM', type: 'task', status: 'pending' },
    { title: 'Training Session', time: 'Tomorrow', type: 'training', status: 'upcoming' },
  ];

  const quickActions = [
    {
      title: 'Mark Attendance',
      description: 'Record today\'s attendance',
      icon: FiCalendar,
      color: 'bg-blue-500',
      href: '/attendance'
    },
    {
      title: 'View Schedule',
      description: 'Check your work schedule',
      icon: FiClock,
      color: 'bg-green-500',
      href: '/schedule'
    },
    {
      title: 'Team Directory',
      description: 'Browse team members',
      icon: FiUsers,
      color: 'bg-purple-500',
      href: '/employees'
    },
    {
      title: 'Request Leave',
      description: 'Apply for time off',
      icon: FiAlertCircle,
      color: 'bg-orange-500',
      href: '/leave/request'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const containerVariants = {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: 'easeOut' }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className="p-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {user?.role === 'HR' ? 'HR Dashboard' : 'Employee Dashboard'}
            </h1>
            <p className="text-gray-600 mt-1">
              Welcome back, {user?.name}. Here's what's happening today.
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Monthly Attendance</p>
            <div className="flex items-center space-x-2">
              <div className="w-24 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${stats.monthlyAttendance}%` }}
                />
              </div>
              <span className="text-sm font-medium text-gray-900">
                {stats.monthlyAttendance}%
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            variants={itemVariants}
            whileHover={{ scale: 1.02, y: -2 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center mb-4">
              <div className={`p-3 rounded-lg bg-gradient-to-r ${stat.color}`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
            <p className="text-gray-600 text-sm mt-1">{stat.title}</p>
            <p className="text-xs text-gray-500 mt-2">{stat.description}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Quick Actions & Schedule */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quickActions.map((action, index) => (
              <motion.button
                key={action.title}
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all text-left group"
              >
                <div className={`${action.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{action.title}</h3>
                <p className="text-sm text-gray-600">{action.description}</p>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Today's Schedule */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Today's Schedule</h2>
          <div className="space-y-3">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className={`w-2 h-2 rounded-full ${
                  activity.status === 'upcoming' ? 'bg-blue-500' :
                  activity.status === 'pending' ? 'bg-orange-500' : 'bg-green-500'
                }`} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
                <FiClock className="w-4 h-4 text-gray-400" />
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Performance & Team */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Overview */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Performance Overview</h2>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Attendance Rate</span>
                <span className="text-sm font-medium text-gray-900">{stats.monthlyAttendance}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${stats.monthlyAttendance}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Task Completion</span>
                <span className="text-sm font-medium text-gray-900">92%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '92%' }} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Team Collaboration</span>
                <span className="text-sm font-medium text-gray-900">88%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-500 h-2 rounded-full" style={{ width: '88%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Team Members */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Team Members</h2>
          <div className="space-y-3">
            {[
              { name: 'Alice Johnson', role: 'Senior Developer', status: 'online', avatar: 'AJ' },
              { name: 'Bob Smith', role: 'Designer', status: 'online', avatar: 'BS' },
              { name: 'Carol White', role: 'Product Manager', status: 'offline', avatar: 'CW' },
              { name: 'David Brown', role: 'Developer', status: 'online', avatar: 'DB' },
            ].map((member, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
                      {member.avatar}
                    </div>
                    <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                      member.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                    }`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{member.name}</p>
                    <p className="text-xs text-gray-500">{member.role}</p>
                  </div>
                </div>
                <FiUser className="w-4 h-4 text-gray-400" />
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default UserDashboard;
