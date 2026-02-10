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
