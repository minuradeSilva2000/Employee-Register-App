/**
 * Admin Dashboard Page
 * Restricted to users with Admin role
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FiUsers,
  FiBriefcase,
  FiTrendingUp,
  FiSettings,
  FiActivity,
  FiUserPlus,
  FiUserCheck,
} from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalEmployees: 0,
    totalDepartments: 0,
    recentLogins: 0,
    systemHealth: 'good'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading dashboard data
    const loadDashboardData = async () => {
      try {
        // In a real app, this would be API calls
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setStats({
          totalUsers: 156,
          activeUsers: 142,
          totalEmployees: 89,
          totalDepartments: 12,
          recentLogins: 23,
          systemHealth: 'good'
        });
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: FiUsers,
      color: 'from-blue-500 to-blue-600',
      change: '+12%',
      changeType: 'positive'
    },
    {
      title: 'Active Users',
      value: stats.activeUsers,
      icon: FiUserCheck,
      color: 'from-green-500 to-green-600',
      change: '+8%',
      changeType: 'positive'
    },
    {
      title: 'Total Employees',
      value: stats.totalEmployees,
      icon: FiBriefcase,
      color: 'from-purple-500 to-purple-600',
      change: '+5%',
      changeType: 'positive'
    },
    {
      title: 'Departments',
      value: stats.totalDepartments,
      icon: FiSettings,
      color: 'from-orange-500 to-orange-600',
      change: '0%',
      changeType: 'neutral'
    }
  ];

  const quickActions = [
    {
      title: 'Add New User',
      description: 'Create a new user account',
      icon: FiUserPlus,
      color: 'bg-blue-500',
      href: '/users/create'
    },
    {
      title: 'Manage Roles',
      description: 'Update user permissions',
      icon: FiSettings,
      color: 'bg-purple-500',
      href: '/users/roles'
    },
    {
      title: 'System Logs',
      description: 'View system activity',
      icon: FiActivity,
      color: 'bg-green-500',
      href: '/admin/logs'
    },
    {
      title: 'Analytics',
      description: 'View detailed analytics',
      icon: FiTrendingUp,
      color: 'bg-orange-500',
      href: '/admin/analytics'
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
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Welcome back, {user?.name}. Here's your system overview.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              stats.systemHealth === 'good' ? 'bg-green-500' : 'bg-yellow-500'
            }`} />
            <span className="text-sm text-gray-600">
              System {stats.systemHealth === 'good' ? 'Healthy' : 'Warning'}
            </span>
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
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg bg-gradient-to-r ${stat.color}`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <span className={`text-sm font-medium ${
                stat.changeType === 'positive' ? 'text-green-600' :
                stat.changeType === 'negative' ? 'text-red-600' : 'text-gray-600'
              }`}>
                {stat.change}
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
            <p className="text-gray-600 text-sm mt-1">{stat.title}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants} className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
      </motion.div>

      {/* Recent Activity */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {[
              { user: 'John Doe', action: 'Created new employee', time: '2 minutes ago', type: 'create' },
              { user: 'Jane Smith', action: 'Updated department', time: '15 minutes ago', type: 'update' },
              { user: 'Bob Johnson', action: 'Deleted user account', time: '1 hour ago', type: 'delete' },
              { user: 'Alice Brown', action: 'Modified permissions', time: '2 hours ago', type: 'update' },
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.type === 'create' ? 'bg-green-500' :
                    activity.type === 'delete' ? 'bg-red-500' : 'bg-blue-500'
                  }`} />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{activity.user}</p>
                    <p className="text-xs text-gray-600">{activity.action}</p>
                  </div>
                </div>
                <span className="text-xs text-gray-500">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">System Overview</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Server Status</span>
              <span className="text-sm font-medium text-green-600">Online</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Database</span>
              <span className="text-sm font-medium text-green-600">Connected</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Last Backup</span>
              <span className="text-sm font-medium text-gray-900">2 hours ago</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Active Sessions</span>
              <span className="text-sm font-medium text-gray-900">{stats.recentLogins}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Storage Used</span>
              <span className="text-sm font-medium text-gray-900">2.4 GB</span>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AdminDashboard;
