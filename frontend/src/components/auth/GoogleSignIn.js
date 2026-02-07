/**
 * Google Sign-In Component
 * Production-ready Google OAuth integration with comprehensive error handling
 */

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { FcGoogle } from 'react-icons/fc';
import { useGoogleAuth } from '../../hooks/useGoogleAuth';
import LoadingSpinner from '../ui/LoadingSpinner';
import toast from 'react-hot-toast';

const GoogleSignIn = ({ 
  onSuccess, 
  onError, 
  disabled = false,
  buttonText = "Continue with Google",
  showCustomButton = true,
  className = ""
}) => {
  const googleButtonRef = useRef(null);
  const [initializationError, setInitializationError] = useState(null);
  
  const {
    isLoading,
    isGoogleLoaded,
    signInWithGoogle,
    renderGoogleButton,
    initializeGoogleSignIn
  } = useGoogleAuth();

  /**
   * Initialize Google Sign-In on component mount
   */
  useEffect(() => {
    const initialize = async () => {
      try {
        // Check if Google Client ID is configured
        if (!import.meta.env.VITE_GOOGLE_CLIENT_ID) {
          const error = 'Google Client ID not configured. Please check your environment variables.';
          setInitializationError(error);
          console.error('❌', error);
          return;
        }

        // Initialize Google Sign-In
        const success = await initializeGoogleSignIn();
        
        if (success && googleButtonRef.current) {
          // Render official Google button (hidden, used as fallback)
          renderGoogleButton('google-signin-button', {
            theme: 'outline',
            size: 'large',
            width: '100%',
          });
        }
        
      } catch (error) {
        const errorMessage = 'Failed to initialize Google Sign-In';
        setInitializationError(errorMessage);
        console.error('❌ Google Sign-In initialization error:', error);
      }
    };

    initialize();
  }, [initializeGoogleSignIn, renderGoogleButton]);

  /**
   * Handle custom button click
   */
  const handleCustomButtonClick = async () => {
    if (disabled || isLoading) return;

    try {
      if (initializationError) {
        toast.error(initializationError);
        return;
      }

      if (!isGoogleLoaded) {
        toast.error('Google Sign-In is not ready. Please try again.');
        return;
      }

      // Trigger Google Sign-In
      await signInWithGoogle();
      
    } catch (error) {
      const errorMessage = 'Failed to start Google Sign-In';
      console.error('❌', errorMessage, error);
      toast.error(errorMessage);
      
      if (onError) {
        onError(errorMessage);
      }
    }
  };

  /**
   * Show error state if initialization failed
   */
  if (initializationError) {
    return (
      <div className={`w-full ${className}`}>
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Google Sign-In Unavailable
              </h3>
              <p className="mt-1 text-sm text-red-700">
                {initializationError}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      {/* Custom Google Sign-In Button */}
      {showCustomButton && (
        <motion.button
          type="button"
          onClick={handleCustomButtonClick}
          disabled={disabled || isLoading || !isGoogleLoaded}
          whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
          whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
          className={`
            w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg
            bg-white text-gray-700 font-medium transition-all duration-200
            ${disabled || isLoading || !isGoogleLoaded
              ? 'opacity-50 cursor-not-allowed' 
              : 'hover:bg-gray-50 hover:border-gray-400 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
            }
          `}
        >
          {isLoading ? (
            <>
              <LoadingSpinner size="sm" className="mr-3" />
              Signing in...
            </>
          ) : (
            <>
              <FcGoogle className="w-5 h-5 mr-3" />
              {buttonText}
            </>
          )}
        </motion.button>
      )}

      {/* Official Google Button Container (Hidden) */}
      <div 
        id="google-signin-button"
        ref={googleButtonRef}
        className="hidden"
        style={{ display: 'none' }}
      />

      {/* Loading State Indicator */}
      {!isGoogleLoaded && !initializationError && (
        <div className="flex items-center justify-center py-2">
          <LoadingSpinner size="sm" className="mr-2" />
          <span className="text-sm text-gray-500">Loading Google Sign-In...</span>
        </div>
      )}
    </div>
  );
};

export default GoogleSignIn;