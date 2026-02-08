import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff, FiUser, FiBriefcase, FiUsers, FiTrendingUp } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import QuickActionButton from '../../components/ui/QuickActionButton';
import GoogleSignIn from '../../components/auth/GoogleSignIn';
import toast from 'react-hot-toast';

// Animation variants
const containerVariants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.8,
      ease: 'easeOut',
    },
  },
};

const leftPanelVariants = {
  initial: {
    x: -80,
    opacity: 0,
  },
  animate: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.8,
      ease: 'easeOut',
      delay: 0.3,
    },
  },
};

const rightPanelVariants = {
  initial: {
    scale: 0.9,
    opacity: 0,
  },
  animate: {
    scale: 1,
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: 'easeOut',
      delay: 0.5,
    },
  },
};

const formVariants = {
  initial: {
    y: 20,
    opacity: 0,
  },
  animate: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
      delay: 0.7,
    },
  },
};

const Login = () => {
  const navigate = useNavigate();
  const { login, loginWithGoogle, isAuthenticated, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle Google Sign-In success
  const handleGoogleSuccess = async (googleData) => {
    try {
      const result = await loginWithGoogle(googleData);
      if (result.success) {
        // Wait a bit for state to update before navigating
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Redirect to main dashboard for all users
        navigate('/', { replace: true });
      }
    } catch (error) {
      console.error('Google login error:', error);
    }
  };

  // Handle Google Sign-In error
  const handleGoogleError = (error) => {
    console.error('Google Sign-In error:', error);
    toast.error('Google Sign-In failed. Please try again.');
  };

  // Handle form submission with proper error handling and security
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const result = await login(formData);
      
      if (result.success) {
        // Clear any previous errors
        setErrors({});
        
        // Wait a bit for state to update before navigating
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Redirect to main dashboard for all users
        navigate('/', { replace: true });
      } else {
        // Handle login failure - show "Invalid credentials" message and clear password
        setErrors({ general: 'Invalid credentials.' });
        setFormData(prev => ({ ...prev, password: '' })); // Clear password field for security
      }
    } catch (error) {
      // Handle any other errors - show "Invalid credentials" message and clear password
      setErrors({ general: 'Invalid credentials.' });
      setFormData(prev => ({ ...prev, password: '' })); // Clear password field for security
      console.error('Login error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick actions for demo purposes with proper routing and role-based access
  const quickActions = [
    {
      icon: FiTrendingUp,
      title: 'Analytics',
      description: 'View reports and insights',
      color: 'from-orange-500 to-orange-600',
      route: '/dashboard',
      roleAccess: ['Admin', 'HR', 'Viewer']
    },
    {
      icon: FiBriefcase,
      title: 'Management',
      description: 'Administrative controls and summaries',
      color: 'from-purple-500 to-purple-600',
      route: '/admin/dashboard',
      roleAccess: ['Admin']
    },
    {
      icon: FiUsers,
      title: 'Department Management',
      description: 'Organize departments and job roles',
      color: 'from-green-500 to-green-600',
      route: '/departments',
      roleAccess: ['Admin', 'HR']
    },
    {
      icon: FiUser,
      title: 'Employee Management',
      description: 'Add, edit, and manage employee records',
      color: 'from-blue-500 to-blue-600',
      route: '/employees',
      roleAccess: ['Admin', 'HR']
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4"
    >
      <div className="w-full max-w-6xl">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="grid lg:grid-cols-2">
            {/* Left Panel - Illustration and Info */}
            <motion.div
              variants={leftPanelVariants}
              className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-primary-600 to-primary-800 p-12 text-white"
            >
              <div>
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="mb-8"
                >
                  <h1 className="text-4xl font-bold mb-2">Employee Management System</h1>
                  <p className="text-primary-100 text-lg">
                    Streamline your HR operations with our comprehensive employee management platform
                  </p>
                </motion.div>

                {/* Quick Actions */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  className="mb-8"
                >
                  <h3 className="text-xl font-semibold mb-6">Quick Actions</h3>
                  <div className="space-y-4">
                    {quickActions.map((action, index) => (
                      <QuickActionButton
                        key={action.title}
                        icon={action.icon}
                        title={action.title}
                        description={action.description}
                        color={action.color}
                        route={action.route}
                        requiredRoles={action.roleAccess}
                        index={index}
                      />
                    ))}
                  </div>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 1.2 }}
                className="text-primary-200 text-sm"
              >
                <p>© 2024 Employee Management System. All rights reserved.</p>
              </motion.div>
            </motion.div>

            {/* Right Panel - Login Form */}
            <motion.div
              variants={rightPanelVariants}
              className="p-12 lg:p-16"
            >
              <motion.div
                variants={formVariants}
                initial="initial"
                animate="animate"
                className="max-w-md mx-auto"
              >
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
                    <FiUsers className="w-8 h-8 text-primary-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
                  <p className="text-gray-600">Sign in to your account to continue</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Email Field */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiMail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`form-input pl-10 ${errors.email ? 'border-error-500 focus:ring-error-500' : ''}`}
                        placeholder="Enter your email"
                        autoComplete="email"
                      />
                    </div>
                    {errors.email && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-1 text-sm text-error-600"
                      >
                        {errors.email}
                      </motion.p>
                    )}
                  </div>

                  {/* Password Field */}
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiLock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className={`form-input pl-10 pr-10 ${errors.password ? 'border-error-500 focus:ring-error-500' : ''}`}
                        placeholder="Enter your password"
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPassword ? (
                          <FiEyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                        ) : (
                          <FiEye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-1 text-sm text-error-600"
                      >
                        {errors.password}
                      </motion.p>
                    )}
                  </div>

                  {/* Remember Me & Forgot Password */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        id="remember"
                        name="remember"
                        type="checkbox"
                        className="form-checkbox h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
                        Remember me
                      </label>
                    </div>
                    <Link
                      to="/forgot-password"
                      className="text-sm text-primary-600 hover:text-primary-500 font-medium"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  {/* Submit Button */}
                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full btn-primary btn-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center">
                        <LoadingSpinner size="sm" className="mr-2" />
                        Signing in...
                      </div>
                    ) : (
                      'Sign In'
                    )}
                  </motion.button>

                  {/* Error Message Display */}
                  {errors.general && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg"
                    >
                      <p className="text-sm text-red-600 font-medium flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.general}
                      </p>
                    </motion.div>
                  )}
                </form>

                {/* Divider */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.9 }}
                  className="mt-6 mb-6"
                >
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">Or continue with</span>
                    </div>
                  </div>
                </motion.div>

                {/* Google Sign-In */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.0 }}
                  className="mb-8"
                >
                  <GoogleSignIn
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    disabled={isSubmitting}
                  />
                </motion.div>

                {/* Demo Accounts Section */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 1.0 }}
                  className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200"
                >
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Demo Accounts</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Try the system with these pre-configured demo accounts:
                  </p>
                  <div className="space-y-3">
                    <div 
                      className="p-3 bg-white rounded-lg border border-gray-200 cursor-pointer hover:border-blue-300 hover:shadow-sm transition-all duration-200"
                      onClick={() => {
                        setFormData({ email: 'admin@example.com', password: 'Admin@123' });
                        setErrors({});
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium text-blue-600">Admin Account</span>
                          <p className="text-xs text-gray-500 mt-1">Full system access</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-mono text-gray-600">admin@example.com</p>
                          <p className="text-xs font-mono text-gray-600">Admin@123</p>
                        </div>
                      </div>
                    </div>
                    <div 
                      className="p-3 bg-white rounded-lg border border-gray-200 cursor-pointer hover:border-purple-300 hover:shadow-sm transition-all duration-200"
                      onClick={() => {
                        setFormData({ email: 'hr@example.com', password: 'Hr@123' });
                        setErrors({});
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium text-purple-600">HR Account</span>
                          <p className="text-xs text-gray-500 mt-1">Employee & department management</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-mono text-gray-600">hr@example.com</p>
                          <p className="text-xs font-mono text-gray-600">Hr@123</p>
                        </div>
                      </div>
                    </div>
                    <div 
                      className="p-3 bg-white rounded-lg border border-gray-200 cursor-pointer hover:border-green-300 hover:shadow-sm transition-all duration-200"
                      onClick={() => {
                        setFormData({ email: 'viewer@example.com', password: 'Viewer@123' });
                        setErrors({});
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium text-green-600">Viewer Account</span>
                          <p className="text-xs text-gray-500 mt-1">Read-only access</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-mono text-gray-600">viewer@example.com</p>
                          <p className="text-xs font-mono text-gray-600">Viewer@123</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-4 text-center">
                    Click any demo account to auto-fill the login form
                  </p>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Login;
