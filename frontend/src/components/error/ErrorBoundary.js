import React from 'react';
import { motion } from 'framer-motion';
import { FiAlertTriangle, FiRefreshCw, FiHome } from 'react-icons/fi';

/**
 * Error Boundary Component - Catches JavaScript errors in component tree
 * 
 * Features:
 * - Catches runtime errors and displays user-friendly UI
 * - Provides error reporting and recovery options
 * - Logs errors for debugging
 * - Maintains app stability
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error: error,
      errorId: `ERR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console
    console.error('🚨 Error Boundary caught an error:', error, errorInfo);
    
    // Log to external service in production
    if (process.env.NODE_ENV === 'production') {
      this.logErrorToService(error, errorInfo);
    }
    
    // Update state with error info
    this.setState({
      error,
      errorInfo,
      errorId: this.state.errorId || `ERR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    });
  }

  logErrorToService = (error, errorInfo) => {
    // In production, send error to logging service
    try {
      const errorData = {
        errorId: this.state.errorId,
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        userId: localStorage.getItem('userId') || 'anonymous'
      };

      // Send to error logging service
      fetch('/api/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(errorData),
      }).catch(err => {
        console.error('Failed to log error to service:', err);
      });
    } catch (err) {
      console.error('Error logging failed:', err);
    }
  };

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  handleGoHome = () => {
    this.handleReset();
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="min-h-screen flex items-center justify-center bg-gray-50 p-4"
        >
          <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-6 text-center">
            {/* Error Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4"
            >
              <FiAlertTriangle className="w-8 h-8 text-red-600" />
            </motion.div>

            {/* Error Message */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Something went wrong
              </h2>
              <p className="text-gray-600 mb-4">
                We encountered an unexpected error. The technical team has been notified.
              </p>
              
              {/* Error Details for Development */}
              {process.env.NODE_ENV === 'development' && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-left">
                  <p className="text-sm text-red-800 font-mono break-all">
                    {this.state.error?.message}
                  </p>
                  {this.state.errorId && (
                    <p className="text-xs text-red-600 mt-2">
                      Error ID: {this.state.errorId}
                    </p>
                  )}
                </div>
              )}
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <button
                onClick={this.handleReset}
                className="flex-1 flex items-center justify-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200"
              >
                <FiRefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </button>
              
              <button
                onClick={this.handleGoHome}
                className="flex-1 flex items-center justify-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200"
              >
                <FiHome className="w-4 h-4 mr-2" />
                Go Home
              </button>
            </motion.div>

            {/* Support Info */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-6 text-sm text-gray-500"
            >
              If the problem persists, please contact support.
              {this.state.errorId && (
                <span className="block mt-1">
                  Reference ID: <span className="font-mono">{this.state.errorId}</span>
                </span>
              )}
            </motion.div>
          </div>
        </motion.div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
