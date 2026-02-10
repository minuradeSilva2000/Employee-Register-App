/**
 * Firebase Authentication Context
 * 
 * FEATURES:
 * - Manual login ONLY (no auto-login)
 * - Firebase signInWithEmailAndPassword
 * - Auth state management with onAuthStateChanged
 * - Proper error handling
 * - TypeScript type safety
 * 
 * BUG FIXES:
 * - Navigation happens AFTER auth state is set
 * - Proper async/await handling
 * - onAuthStateChanged correctly implemented
 * - No race conditions
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  User as FirebaseUser,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  AuthError
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { LoginCredentials, LoginResult } from '../types';

// ==================== CONTEXT TYPES ====================

interface AuthContextValue {
  currentUser: FirebaseUser | null;
  loading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<LoginResult>;
  logout: () => Promise<void>;
  clearError: () => void;
}

// ==================== CONTEXT CREATION ====================

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ==================== PROVIDER COMPONENT ====================

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * MANUAL LOGIN FUNCTION
   * 
   * Uses Firebase signInWithEmailAndPassword
   * NO auto-login logic
   * User must manually enter credentials
   * 
   * BUG FIX:
   * - Returns LoginResult with success flag
   * - Navigation happens AFTER this function completes
   * - Proper error handling for invalid credentials
   */
  const login = async (credentials: LoginCredentials): Promise<LoginResult> => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔵 Attempting Firebase login for:', credentials.email);

      // Firebase signInWithEmailAndPassword
      const userCredential = await signInWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password
      );

      console.log('✅ Firebase login successful:', userCredential.user.email);

      // Return success with user data
      return {
        success: true,
        user: userCredential.user
      };

    } catch (err) {
      const authError = err as AuthError;
      let errorMessage = 'Invalid email or password';

      // Handle specific Firebase auth errors
      switch (authError.code) {
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address format';
          break;
        case 'auth/user-disabled':
          errorMessage = 'This account has been disabled';
          break;
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed attempts. Please try again later';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your connection';
          break;
        default:
          errorMessage = 'Invalid email or password';
      }

      console.error('❌ Firebase login error:', authError.code, errorMessage);

      setError(errorMessage);

      // Return failure with error message
      return {
        success: false,
        error: errorMessage
      };

    } finally {
      setLoading(false);
    }
  };

  /**
   * LOGOUT FUNCTION
   * 
   * Signs out user from Firebase
   * Clears auth state
   */
  const logout = async (): Promise<void> => {
    try {
      setLoading(true);
      await signOut(auth);
      console.log('✅ User logged out successfully');
    } catch (err) {
      const error = err as Error;
      console.error('❌ Logout error:', error.message);
      setError('Failed to logout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * CLEAR ERROR FUNCTION
   */
  const clearError = (): void => {
    setError(null);
  };

  /**
   * AUTH STATE LISTENER
   * 
   * BUG FIX:
   * - Uses onAuthStateChanged to track auth state
   * - Updates currentUser when auth state changes
   * - Ensures navigation happens AFTER auth state is set
   * - No race conditions
   */
  useEffect(() => {
    console.log('🔵 Setting up Firebase auth state listener...');

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log('✅ Auth state changed: User logged in', user.email);
        setCurrentUser(user);
      } else {
        console.log('⚪ Auth state changed: User logged out');
        setCurrentUser(null);
      }
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => {
      console.log('🔵 Cleaning up auth state listener');
      unsubscribe();
    };
  }, []);

  // Context value
  const value: AuthContextValue = {
    currentUser,
    loading,
    error,
    login,
    logout,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// ==================== CUSTOM HOOK ====================

/**
 * useAuth Hook
 * 
 * Access auth context from any component
 * Throws error if used outside AuthProvider
 */
export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};

export default AuthContext;

/**
 * USAGE EXAMPLE:
 * 
 * import { useAuth } from './contexts/AuthContext';
 * 
 * function LoginComponent() {
 *   const { login, currentUser, loading, error } = useAuth();
 * 
 *   const handleLogin = async (email: string, password: string) => {
 *     const result = await login({ email, password });
 *     if (result.success) {
 *       // Navigate to dashboard
 *       navigate('/dashboard');
 *     }
 *   };
 * 
 *   return (
 *     // Login form JSX
 *   );
 * }
 */
