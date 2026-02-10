/**
 * Firebase Authentication Context
 * 
 * MANUAL LOGIN ONLY - No auto-login logic
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User as FirebaseUser,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { LoginCredentials, AuthContextType } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Manual login function
  const login = async (credentials: LoginCredentials): Promise<void> => {
    await signInWithEmailAndPassword(auth, credentials.email, credentials.password);
  };

  // Logout function
  const logout = async (): Promise<void> => {
    await signOut(auth);
  };

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    currentUser,
    loading,
    login,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
