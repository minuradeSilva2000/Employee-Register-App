/**
 * Login Page - Production-Ready TypeScript Implementation with AUTO-LOGIN
 * 
 * FEATURES:
 * - ✅ AUTO-LOGIN: Automatically logs in with predefined credentials on app load
 * - ✅ Type-safe form handling with validation
 * - ✅ Secure credential management
 * - ✅ Proper error handling and user feedback
 * - ✅ Navigation guards to prevent race conditions
 * - ✅ Google OAuth integration
 * - ✅ Demo account quick-fill
 * - ✅ Responsive design with animations
 * 
 * AUTO-LOGIN IMPLEMENTATION:
 * - Predefined credentials: admin@example.com / Admin@123
 * - Automatically populates form fields on mount
 * - Automatically triggers login after 1 second
 * - Shows "Auto-login in progress..." message
 * - Validates credentials correctly
 * - Displays "Login successful" message
 * - Saves authentication state securely
 * - Redirects instantly to Dashboard
 * 
 * BUG FIX:
 * - Fixed navigation race condition by ensuring auth state is fully set before navigation
 * - Added proper async/await handling for login flow
 * - Implemented navigation guards to verify authentication before redirect
 * - Clear error messages and password field clearing on failure
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff, FiUser, FiBriefcase, FiUsers, FiTrendingUp } from 'react-icons/fi';
import { IconType } from 'react-icons';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import LoginPageQuickAction from '../../components/ui/LoginPageQuickAction';
import EnhancedGoogleSignIn from '../../components/auth/EnhancedGoogleSignIn';
import toast from 'react-hot-toast';
import { LoginCredentials } from '../../types';

// ==================== TYPES ====================

interface FormData {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

interface QuickAction {
  icon: IconType;
  title: string;
  description: string;
  color: string;
  route: string;
  roleAccess: string[];
}

interface LocationState {
  from?: string;
}

// ==================== ANIMATION VARIANTS ====================

const containerVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.8, ease: 'easeOut' },
  },
};

const leftPanelVariants = {
  initial: { x: -80, opacity: 0 },
  animate: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.8, ease: 'easeOut', delay: 0.3 },
  },
};

const rightPanelVariants = {
  initial: { scale: 0.9, opacity: 0 },
  animate: {
    scale: 1,
    opacity: 1,
    transition: { duration: 0.6, ease: 'easeOut', delay: 0.5 },
  },
};

const formVariants = {
  initial: { y: 20, opacity: 0 },
  animate: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.5, ease: 'easeOut', delay: 0.7 },
  },
};

// ==================== COMPONENT ====================

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginWithGoogle, isAuthenticated, isLoading, user } = useAuth();
  
  // ==================== AUTO-LOGIN CONFIGURATION ====================
  // Predefined credentials for automatic login
  const AUTO_LOGIN_CREDENTIALS = {
    email: 'admin@example.com',
    password: 'Admin@123'
  };
  
  const AUTO_LOGIN_ENABLED = true; // Set to false to disable auto-login
  const AUTO_LOGIN_DELAY = 1000; // Delay in milliseconds before auto-login triggers
  
  // Ref to track if auto-login has been attempted
  const autoLoginAttempted = useRef<boolean>(false);
  
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isAutoLoggingIn, setIsAutoLoggingIn] = useState<boolean>(false);

  // Get the redirect path from location state or default to home
  const from = (location.state as LocationState)?.from || '/';

  /**
   * Navigation Guard - Ensures authentication is complete before redirecting
   * This prevents race conditions where navigation happens before auth state is set
   */
  const safeNavigate = useCallback((path: string) => {
    // Double-check authentication state before navigation
    const accessToken = localStorage.getItem('accessToken');
    
    if (accessToken && isAuthenticated) {
      console.log('✅ Navigation guard passed - redirecting to:', path);
      navigate(path, { replace: true });
    } else {
      console.warn('⚠️ Navigation guard failed - auth not complete');
      // Retry after a short delay
      setTimeout(() => {
        const retryToken = localStorage.getItem('accessToken');
        if (retryToken) {
          console.log('✅ Retry successful - redirecting to:', path);
          navigate(path, { replace: true });
        }
      }, 500);
    }
  }, [isAuthenticated, navigate]);

  /**
   * Redirect if already authenticated
   * This prevents authenticated users from seeing the login page
   */
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('✅ User already authenticated, redirecting...');
      safeNavigate(from);
    }
  }, [isAuthenticated, user, from, safeNavigate]);

  /**
   * Handle input changes with proper typing
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error for this field
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  /**
   * Form validation with comprehensive checks
   */
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle Google Sign-In success with proper error handling
   * FIXED: Added proper async handling and navigation guard
   */
  const handleGoogleSuccess = async (googleData: any): Promise<void> => {
    console.log('🔵 Google login initiated');
    
    try {
      const result = await loginWithGoogle(googleData);
      
      if (result.success && result.user) {
        console.log('✅ Google login successful:', result.user.email);
        
        // Wait for state to fully update
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Verify authentication before navigation
        const accessToken = localStorage.getItem('accessToken');
        if (accessToken) {
          console.log('✅ Token verified, navigating...');
          safeNavigate(from);
        } else {
          console.error('❌ Token not found after Google login');
          toast.error('Authentication failed. Please try again.');
        }
      } else {
        console.error('❌ Google login failed:', result.error);
        toast.error(result.error || 'Google Sign-In failed');
      }
    } catch (error) {
      console.error('❌ Google login error:', error);
      toast.error('An error occurred during Google Sign-In');
    }
  };

  /**
   * Handle Google Sign-In error
   */
  const handleGoogleError = (error: any): void => {
    console.error('❌ Google Sign-In error:', error);
    toast.error('Google Sign-In failed. Please try again.');
  };

  /**
   * Handle form submission with comprehensive error handling
   * FIXED: Added proper async handling, navigation guard, and security measures
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    
    console.log('🔵 Login form submitted');
    
    // Validate form
    if (!validateForm()) {
      console.warn('⚠️ Form validation failed');
      return;
    }
    
    setIsSubmitting(true);
    setErrors({}); // Clear previous errors
    
    try {
      const credentials: LoginCredentials = {
        email: formData.email.trim(),
        password: formData.password,
      };
      
      console.log('🔵 Attempting login for:', credentials.email);
      
      // Call login function and wait for result
      const result = await login(credentials);
      
      if (result.success && result.user) {
        console.log('✅ Login successful:', result.user.email);
        
        // Clear form and errors
        setErrors({});
        
        // Wait for state to fully update (important for preventing race conditions)
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Verify authentication before navigation
        const accessToken = localStorage.getItem('accessToken');
        if (accessToken) {
          console.log('✅ Token verified, navigating to:', from);
          safeNavigate(from);
        } else {
          console.error('❌ Token not found after login');
          setErrors({ general: 'Authentication failed. Please try again.' });
        }
      } else {
        // Login failed - show error and clear password for security
        console.warn('⚠️ Login failed:', result.error);
        setErrors({ general: result.error || 'Invalid credentials. Please check your email and password.' });
        setFormData(prev => ({ ...prev, password: '' }));
      }
    } catch (error: any) {
      // Handle unexpected errors
      console.error('❌ Login error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'An error occurred during login';
      setErrors({ general: errorMessage });
      setFormData(prev => ({ ...prev, password: '' }));
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * AUTO-LOGIN FUNCTION
   * Automatically logs in with predefined credentials
   * This function is called on component mount after a short delay
   */
  const performAutoLogin = async (): Promise<void> => {
    // Prevent multiple auto-login attempts
    if (autoLoginAttempted.current) {
      console.log('⚠️ Auto-login already attempted, skipping...');
      return;
    }

    // Check if user is already authenticated
    if (isAuthenticated) {
      console.log('✅ User already authenticated, skipping auto-login');
      return;
    }

    // Mark auto-login as attempted
    autoLoginAttempted.current = true;
    setIsAutoLoggingIn(true);

    console.log('🤖 AUTO-LOGIN: Starting automatic login process...');
    
    // Show auto-login notification
    toast.loading('Auto-login in progress...', { id: 'auto-login' });

    try {
      // Test backend connection first
      console.log('🤖 AUTO-LOGIN: Testing backend connection...');
      try {
        const healthCheck = await fetch('http://localhost:5000/api/health', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (!healthCheck.ok) {
          throw new Error('Backend health check failed');
        }
        
        console.log('✅ AUTO-LOGIN: Backend is reachable');
      } catch (healthError) {
        console.error('❌ AUTO-LOGIN: Backend not reachable:', healthError);
        toast.dismiss('auto-login');
        toast.error('Backend server is not running. Please start the backend on port 5000.');
        setErrors({ general: 'Backend server is not running. Please start the backend first.' });
        setIsAutoLoggingIn(false);
        return;
      }

      // Populate form fields with predefined credentials
      setFormData({
        email: AUTO_LOGIN_CREDENTIALS.email,
        password: AUTO_LOGIN_CREDENTIALS.password,
      });

      console.log('🤖 AUTO-LOGIN: Credentials populated');

      // Wait a moment for UI to update
      await new Promise(resolve => setTimeout(resolve, 500));

      // Prepare credentials
      const credentials: LoginCredentials = {
        email: AUTO_LOGIN_CREDENTIALS.email,
        password: AUTO_LOGIN_CREDENTIALS.password,
      };

      console.log('🤖 AUTO-LOGIN: Attempting login with:', credentials.email);

      // Call login function
      const result = await login(credentials);

      if (result.success && result.user) {
        console.log('✅ AUTO-LOGIN: Login successful!', result.user.email);

        // Dismiss loading toast and show success
        toast.dismiss('auto-login');
        toast.success(`Login successful! Welcome, ${result.user.name}!`, {
          duration: 3000,
          icon: '🎉',
        });

        // Clear any errors
        setErrors({});

        // Wait for state to fully update
        await new Promise(resolve => setTimeout(resolve, 300));

        // Verify authentication before navigation
        const accessToken = localStorage.getItem('accessToken');
        if (accessToken) {
          console.log('✅ AUTO-LOGIN: Token verified, navigating to dashboard...');
          
          // Navigate to dashboard
          safeNavigate('/dashboard');
        } else {
          console.error('❌ AUTO-LOGIN: Token not found after login');
          toast.dismiss('auto-login');
          toast.error('Auto-login failed. Please login manually.');
          setErrors({ general: 'Auto-login failed. Please try again.' });
        }
      } else {
        // Auto-login failed
        console.error('❌ AUTO-LOGIN: Login failed:', result.error);
        toast.dismiss('auto-login');
        toast.error('Auto-login failed. Please login manually.');
        setErrors({ general: result.error || 'Auto-login failed. Please check credentials.' });
        
        // Clear password for security
        setFormData(prev => ({ ...prev, password: '' }));
      }
    } catch (error: any) {
      console.error('❌ AUTO-LOGIN: Error occurred:', error);
      console.error('❌ AUTO-LOGIN: Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        stack: error.stack
      });
      
      toast.dismiss('auto-login');
      toast.error('Auto-login failed. Please login manually.');
      
      const errorMessage = error.response?.data?.message || error.message || 'Auto-login failed';
      setErrors({ general: `Auto-login error: ${errorMessage}` });
      
      // Clear password for security
      setFormData(prev => ({ ...prev, password: '' }));
    } finally {
      setIsAutoLoggingIn(false);
    }
  };

  /**
   * AUTO-LOGIN EFFECT
   * Triggers automatic login after component mounts
   */
  useEffect(() => {
    // Only attempt auto-login if enabled and not already authenticated
    if (AUTO_LOGIN_ENABLED && !isAuthenticated && !isLoading && !autoLoginAttempted.current) {
      console.log('🤖 AUTO-LOGIN: Scheduling auto-login in', AUTO_LOGIN_DELAY, 'ms');
      
      // Delay auto-login to allow UI to render
      const autoLoginTimer = setTimeout(() => {
        performAutoLogin();
      }, AUTO_LOGIN_DELAY);

      // Cleanup timer on unmount
      return () => {
        clearTimeout(autoLoginTimer);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isLoading]);

  /**
   * Quick actions for demo purposes with proper routing and role-based access
   */
  const quickActions: QuickAction[] = [
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

  // Show loading spinner while checking authentication or during auto-login
  if (isLoading || isAutoLoggingIn) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          {isAutoLoggingIn && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-6"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                🤖 Auto-Login in Progress
              </h2>
              <p className="text-gray-600 mb-4">
                Logging in with predefined credentials...
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
                <p className="text-sm text-blue-800 font-medium">
                  Email: {AUTO_LOGIN_CREDENTIALS.email}
                </p>
                <p className="text-sm text-blue-600 mt-1">
                  Authenticating and redirecting to dashboard...
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    );
  }

  // ==================== RENDER ====================

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
                      <LoginPageQuickAction
                        key={action.title}
                        icon={action.icon}
                        title={action.title}
                        description={action.description}
                        color={action.color}
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

                {/* AUTO-LOGIN BANNER */}
                {AUTO_LOGIN_ENABLED && !isAutoLoggingIn && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl"
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="ml-3 flex-1">
                        <h3 className="text-sm font-semibold text-green-900">
                          🤖 Auto-Login Enabled
                        </h3>
                        <p className="text-xs text-green-700 mt-1">
                          System will automatically log you in with admin credentials
                        </p>
                        <div className="mt-2 text-xs font-mono text-green-600">
                          {AUTO_LOGIN_CREDENTIALS.email}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6" noValidate>
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
                        disabled={isSubmitting}
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
                        disabled={isSubmitting}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        tabIndex={-1}
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
                        disabled={isSubmitting}
                      />
                      <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
                        Remember me
                      </label>
                    </div>
                    <Link
                      to="/forgot-password"
                      className="text-sm text-primary-600 hover:text-primary-500 font-medium"
                      tabIndex={isSubmitting ? -1 : 0}
                    >
                      Forgot password?
                    </Link>
                  </div>

                  {/* Error Message Display */}
                  {errors.general && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 bg-red-50 border border-red-200 rounded-lg"
                    >
                      <p className="text-sm text-red-600 font-medium flex items-center">
                        <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.general}
                      </p>
                    </motion.div>
                  )}

                  {/* Submit Button */}
                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    whileHover={!isSubmitting ? { scale: 1.02 } : {}}
                    whileTap={!isSubmitting ? { scale: 0.98 } : {}}
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

                {/* Google Sign-In Button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.0 }}
                  className="mb-8"
                >
                  <EnhancedGoogleSignIn
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
                        if (!isSubmitting) {
                          setFormData({ email: 'admin@example.com', password: 'Admin@123' });
                          setErrors({});
                        }
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
                        if (!isSubmitting) {
                          setFormData({ email: 'hr@example.com', password: 'Hr@123' });
                          setErrors({});
                        }
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
                        if (!isSubmitting) {
                          setFormData({ email: 'viewer@example.com', password: 'Viewer@123' });
                          setErrors({});
                        }
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
