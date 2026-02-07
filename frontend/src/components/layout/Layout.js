import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiHome,
  FiUsers,
  FiBriefcase,
  FiCalendar,
  FiSettings,
  FiUser,
  FiLogOut,
  FiBell,
  FiMenu,
  FiX,
  FiChevronDown,
  FiTrendingUp,
} from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import NotificationPanel from '../notifications/NotificationPanel';

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, hasPermission } = useAuth();
  const { unreadCount, isConnected } = useNotifications();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Navigation items based on user role and permissions
  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/',
      icon: FiHome,
      permission: 'dashboard:read',
    },
    {
      name: 'Employees',
      href: '/employees',
      icon: FiUsers,
      permission: 'employees:read',
    },
    {
      name: 'Departments',
      href: '/departments',
      icon: FiBriefcase,
      permission: 'departments:read',
    },
    {
      name: 'Job Titles',
      href: '/job-titles',
      icon: FiSettings,
      permission: 'jobTitles:read',
    },
    {
      name: 'Attendance',
      href: '/attendance',
      icon: FiCalendar,
      permission: 'attendance:read',
    },
    {
      name: 'Users',
      href: '/users',
      icon: FiUser,
      permission: 'users:read',
      roles: ['Admin'], // Only Admin can see Users
    },
    {
      name: 'Analytics',
      href: '/analytics',
      icon: FiTrendingUp,
      permission: 'dashboard:read',
    },
  ].filter(item => {
    // Filter based on role restrictions
    if (item.roles && !item.roles.includes(user?.role)) {
      return false;
    }
    // Filter based on permissions
    if (item.permission && !hasPermission(item.permission)) {
      return false;
    }
    return true;
  });

  // Close sidebar when route changes
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.user-menu')) {
        setUserMenuOpen(false);
      }
      if (!event.target.closest('.notification-panel')) {
        setShowNotificationPanel(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const sidebarVariants = {
    open: {
      x: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30,
      },
    },
    closed: {
      x: '-100%',
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30,
      },
    },
  };

  const overlayVariants = {
    open: {
      opacity: 1,
      transition: { duration: 0.2 },
    },
    closed: {
      opacity: 0,
      transition: { duration: 0.2 },
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            variants={overlayVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="fixed inset-0 z-40 lg:hidden bg-gray-600 bg-opacity-75"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        variants={sidebarVariants}
        initial="closed"
        animate={sidebarOpen ? 'open' : 'closed'}
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform lg:translate-x-0 lg:static lg:inset-0 ${
          sidebarOpen ? 'block' : 'hidden'
        } lg:block`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <FiUsers className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="ml-3">
              <h1 className="text-xl font-bold text-gray-900">EMS</h1>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-gray-600"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {navigationItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <button
                  key={item.name}
                  onClick={() => navigate(item.href)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                    isActive
                      ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </button>
              );
            })}
          </div>
        </nav>

        {/* User Info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0 w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
              {user?.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt={user.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6366f1&color=fff&size=32`;
                  }}
                />
              ) : (
                <FiUser className="w-4 h-4 text-gray-600" />
              )}
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500">{user?.role}</p>
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-400 hover:text-gray-600"
            >
              <FiMenu className="w-6 h-6" />
            </button>

            {/* Right side items */}
            <div className="flex items-center space-x-4">
              {/* Connection Status */}
              <div className="flex items-center">
                <div className={`w-2 h-2 rounded-full mr-2 ${
                  isConnected ? 'bg-green-500' : 'bg-gray-400'
                }`} />
                <span className="text-xs text-gray-500">
                  {isConnected ? 'Connected' : 'Offline'}
                </span>
              </div>

              {/* Notifications */}
              <div className="relative notification-panel">
                <button
                  onClick={() => setShowNotificationPanel(!showNotificationPanel)}
                  className="relative p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-full"
                >
                  <FiBell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-error-500 ring-2 ring-white" />
                  )}
                </button>

                {/* Notification Panel */}
                <AnimatePresence>
                  {showNotificationPanel && (
                    <NotificationPanel onClose={() => setShowNotificationPanel(false)} />
                  )}
                </AnimatePresence>
              </div>

              {/* User Menu */}
              <div className="relative user-menu">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-3 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 p-1"
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                    {user?.profilePicture ? (
                      <img
                        src={user.profilePicture}
                        alt={user.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6366f1&color=fff&size=32`;
                        }}
                      />
                    ) : (
                      <FiUser className="w-4 h-4 text-gray-600" />
                    )}
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                    <p className="text-xs text-gray-500">{user?.role}</p>
                  </div>
                  <FiChevronDown className="w-4 h-4 text-gray-400" />
                </button>

                {/* User Dropdown */}
                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50"
                    >
                      <div className="py-1">
                        <button
                          onClick={() => {
                            navigate('/profile');
                            setUserMenuOpen(false);
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Your Profile
                        </button>
                        <button
                          onClick={() => {
                            navigate('/settings');
                            setUserMenuOpen(false);
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Settings
                        </button>
                        <div className="border-t border-gray-100"></div>
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                        >
                          <div className="flex items-center">
                            <FiLogOut className="mr-2 h-4 w-4" />
                            Sign out
                          </div>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
