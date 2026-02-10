/**
 * Authentication Service
 */

import api from './api';
import { LoginCredentials, AuthResponse } from '../types';

export const authService = {
  /**
   * Login with email and password
   */
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', credentials);
    return response;
  },

  /**
   * Login with Google OAuth
   */
  loginWithGoogle: async (): Promise<AuthResponse> => {
    // Get Google Client ID from environment
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    
    if (!clientId) {
      throw new Error('Google Client ID not configured. Please add VITE_GOOGLE_CLIENT_ID to your environment variables.');
    }

    // Initialize Google OAuth
    return new Promise((resolve, reject) => {
      // Load Google Identity Services
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        // @ts-ignore
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response: any) => {
            try {
              // Send Google token to backend
              const authResponse = await api.post('/auth/google', {
                credential: response.credential
              });
              resolve(authResponse);
            } catch (error) {
              reject(error);
            }
          }
        });

        // @ts-ignore
        window.google.accounts.id.prompt();
      };

      script.onerror = () => {
        reject(new Error('Failed to load Google Sign-In'));
      };

      document.body.appendChild(script);
    });
  },

  /**
   * Verify token
   */
  verifyToken: async (token: string): Promise<any> => {
    const response = await api.post('/auth/verify', { token });
    return response;
  },

  /**
   * Logout
   */
  logout: (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};
