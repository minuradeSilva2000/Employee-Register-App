import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';

// Context Providers
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';

// Components
import ProtectedRoute from './components/auth/ProtectedRoute';
import RoleRoute from './components/auth/RoleRoute';
import OAuthCallback from './components/auth/OAuthCallback';
import Layout from './components/layout/Layout';

// Pages
import Login from './pages/auth/Login';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserDashboard from './pages/user/UserDashboard';
import Employees from './pages/employees/Employees';
import EmployeeDetail from './pages/employees/EmployeeDetail';
import Departments from './pages/departments/Departments';
import JobTitles from './pages/job-titles/JobTitles';
import Attendance from './pages/attendance/Attendance';
import Users from './pages/users/Users';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';

// Page transition variants
const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.98
  },
  in: {
    opacity: 1,
    y: 0,
    scale: 1
  },
  out: {
    opacity: 0,
    y: -20,
    scale: 1.02
  }
};

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.3
};

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <NotificationProvider>
          <Router>
            <AnimatePresence mode="wait">
              <Routes>
                {/* Public Routes */}
                <Route 
                  path="/login" 
                  element={
                    <motion.div
                      initial="initial"
                      animate="in"
                      exit="out"
                      variants={pageVariants}
                      transition={pageTransition}
                    >
                      <Login />
                    </motion.div>
                  } 
                />

                {/* OAuth Callback Route */}
                <Route 
                  path="/auth/callback" 
                  element={
                    <motion.div
                      initial="initial"
                      animate="in"
                      exit="out"
                      variants={pageVariants}
                      transition={pageTransition}
                    >
                      <OAuthCallback />
                    </motion.div>
                  } 
                />

                {/* Protected Routes */}
                <Route 
                  path="/" 
                  element={
                    <ProtectedRoute>
                      <Layout />
                    </ProtectedRoute>
                  }
                >
                  {/* Admin Dashboard - Role Protected */}
                  <Route 
                    path="admin/dashboard" 
                    element={
                      <RoleRoute requiredRoles={['Admin']}>
                        <motion.div
                          initial="initial"
                          animate="in"
                          exit="out"
                          variants={pageVariants}
                          transition={pageTransition}
                        >
                          <AdminDashboard />
                        </motion.div>
                      </RoleRoute>
                    } 
                  />

                  {/* User Dashboard - Role Protected */}
                  <Route 
                    path="user/dashboard" 
                    element={
                      <RoleRoute requiredRoles={['Admin', 'HR', 'Viewer']}>
                        <motion.div
                          initial="initial"
                          animate="in"
                          exit="out"
                          variants={pageVariants}
                          transition={pageTransition}
                        >
                          <UserDashboard />
                        </motion.div>
                      </RoleRoute>
                    } 
                  />

                  {/* Dashboard */}
                  <Route 
                    index 
                    element={
                      <motion.div
                        initial="initial"
                        animate="in"
                        exit="out"
                        variants={pageVariants}
                        transition={pageTransition}
                      >
                        <Dashboard />
                      </motion.div>
                    } 
                  />

                  {/* Employee Management */}
                  <Route 
                    path="employees" 
                    element={
                      <motion.div
                        initial="initial"
                        animate="in"
                        exit="out"
                        variants={pageVariants}
                        transition={pageTransition}
                      >
                        <Employees />
                      </motion.div>
                    } 
                  />
                  <Route 
                    path="employees/:id" 
                    element={
                      <motion.div
                        initial="initial"
                        animate="in"
                        exit="out"
                        variants={pageVariants}
                        transition={pageTransition}
                      >
                        <EmployeeDetail />
                      </motion.div>
                    } 
                  />

                  {/* Department Management */}
                  <Route 
                    path="departments" 
                    element={
                      <motion.div
                        initial="initial"
                        animate="in"
                        exit="out"
                        variants={pageVariants}
                        transition={pageTransition}
                      >
                        <Departments />
                      </motion.div>
                    } 
                  />

                  {/* Job Title Management */}
                  <Route 
                    path="job-titles" 
                    element={
                      <motion.div
                        initial="initial"
                        animate="in"
                        exit="out"
                        variants={pageVariants}
                        transition={pageTransition}
                      >
                        <JobTitles />
                      </motion.div>
                    } 
                  />

                  {/* Attendance Management */}
                  <Route 
                    path="attendance" 
                    element={
                      <motion.div
                        initial="initial"
                        animate="in"
                        exit="out"
                        variants={pageVariants}
                        transition={pageTransition}
                      >
                        <Attendance />
                      </motion.div>
                    } 
                  />

                  {/* User Management */}
                  <Route 
                    path="users" 
                    element={
                      <motion.div
                        initial="initial"
                        animate="in"
                        exit="out"
                        variants={pageVariants}
                        transition={pageTransition}
                      >
                        <Users />
                      </motion.div>
                    } 
                  />

                  {/* Profile */}
                  <Route 
                    path="profile" 
                    element={
                      <motion.div
                        initial="initial"
                        animate="in"
                        exit="out"
                        variants={pageVariants}
                        transition={pageTransition}
                      >
                        <Profile />
                      </motion.div>
                    } 
                  />

                  {/* Settings */}
                  <Route 
                    path="settings" 
                    element={
                      <motion.div
                        initial="initial"
                        animate="in"
                        exit="out"
                        variants={pageVariants}
                        transition={pageTransition}
                      >
                        <Settings />
                      </motion.div>
                    } 
                  />
                </Route>

                {/* 404 Page */}
                <Route 
                  path="*" 
                  element={
                    <motion.div
                      initial="initial"
                      animate="in"
                      exit="out"
                      variants={pageVariants}
                      transition={pageTransition}
                    >
                      <NotFound />
                    </motion.div>
                  } 
                />
              </Routes>
            </AnimatePresence>

            {/* Global Toast Notifications */}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#22c55e',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 5000,
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </Router>
        </NotificationProvider>
      </AuthProvider>
    </div>
  );
}

export default App;
