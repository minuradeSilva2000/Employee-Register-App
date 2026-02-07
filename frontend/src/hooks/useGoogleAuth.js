/**
 * Google Authentication Hook
 * Handles Google Sign-In integration with backend
 */

import { useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export const useGoogleAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
  const { loginWithGoogle } = useAuth();

  /**
   * Handle Google Sign-In Response
   */
  const handleGoogleResponse = useCallback(async (response) => {
    setIsLoading(true);
    
    try {
      console.log('🔄 Processing Google Sign-In response');
      
      if (!response.credential) {
        throw new Error('No credential received from Google');
      }

      // Send Google ID token to backend
      const result = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/google/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies
        body: JSON.stringify({
          idToken: response.credential,
        }),
      });

      const data = await result.json();

      if (!result.ok) {
        throw new Error(data.message || 'Google authentication failed');
      }

      if (data.success) {
        console.log('🎉 Google authentication successful');
        
        // Update auth context
        await loginWithGoogle({
          user: data.data.user,
          accessToken: data.data.accessToken,
        });

        // Show success message
        toast.success(data.message || 'Successfully logged in with Google account', {
          duration: 4000,
          icon: '🎉',
        });

        return { success: true, user: data.data.user };
      } else {
        throw new Error(data.message || 'Authentication failed');
      }
      
    } catch (error) {
      console.error('❌ Google Sign-In error:', error);
      
      const errorMessage = error.message || 'Google Sign-In failed. Please try again.';
      toast.error(errorMessage, {
        duration: 5000,
      });
      
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [loginWithGoogle]);

  /**
   * Load Google Identity Services Script
   */
  const loadGoogleScript = useCallback(() => {
    return new Promise((resolve, reject) => {
      // Check if already loaded
      if (window.google?.accounts?.id) {
        setIsGoogleLoaded(true);
        return resolve(true);
      }

      // Check if script is already in DOM
      if (document.querySelector('script[src*="accounts.google.com/gsi/client"]')) {
        // Wait for it to load
        const checkLoaded = setInterval(() => {
          if (window.google?.accounts?.id) {
            clearInterval(checkLoaded);
            setIsGoogleLoaded(true);
            resolve(true);
          }
        }, 100);
        
        // Timeout after 10 seconds
        setTimeout(() => {
          clearInterval(checkLoaded);
          reject(new Error('Google script load timeout'));
        }, 10000);
        
        return;
      }

      // Create and load script
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        console.log('✅ Google Identity Services loaded');
        setIsGoogleLoaded(true);
        resolve(true);
      };
      
      script.onerror = () => {
        console.error('❌ Failed to load Google Identity Services');
        reject(new Error('Failed to load Google script'));
      };
      
      document.head.appendChild(script);
    });
  }, []);

  /**
   * Initialize Google Sign-In
   */
  const initializeGoogleSignIn = useCallback(async () => {
    try {
      if (!import.meta.env.VITE_GOOGLE_CLIENT_ID) {
        throw new Error('Google Client ID not configured');
      }

      await loadGoogleScript();

      // Initialize Google Sign-In
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      console.log('✅ Google Sign-In initialized');
      return true;
      
    } catch (error) {
      console.error('❌ Google Sign-In initialization failed:', error);
      toast.error('Failed to initialize Google Sign-In');
      return false;
    }
  }, [loadGoogleScript, handleGoogleResponse]);

  /**
   * Trigger Google Sign-In Popup
   */
  const signInWithGoogle = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const initialized = await initializeGoogleSignIn();
      if (!initialized) {
        throw new Error('Failed to initialize Google Sign-In');
      }

      // Trigger Google Sign-In popup
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          console.log('Google Sign-In prompt not displayed or skipped');
          setIsLoading(false);
        }
      });
      
    } catch (error) {
      console.error('❌ Google Sign-In trigger error:', error);
      toast.error('Failed to start Google Sign-In');
      setIsLoading(false);
    }
  }, [initializeGoogleSignIn]);

  /**
   * Render Google Sign-In Button
   */
  const renderGoogleButton = useCallback((containerId, options = {}) => {
    const defaultOptions = {
      theme: 'outline',
      size: 'large',
      width: '100%',
      text: 'signin_with',
      shape: 'rectangular',
      logo_alignment: 'left',
    };

    const buttonOptions = { ...defaultOptions, ...options };

    if (window.google?.accounts?.id && isGoogleLoaded) {
      window.google.accounts.id.renderButton(
        document.getElementById(containerId),
        buttonOptions
      );
    }
  }, [isGoogleLoaded]);

  return {
    isLoading,
    isGoogleLoaded,
    signInWithGoogle,
    renderGoogleButton,
    initializeGoogleSignIn,
  };
};