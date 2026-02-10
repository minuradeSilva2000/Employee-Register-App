/**
 * API Service
 * 
 * Centralized API configuration with request/response interceptors
 * Handles authentication tokens and error responses
 */

import axios, { AxiosInstance, AxiosError } from 'axios';

// Use environment variable or fallback to localhost
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000 // 10 second timeout
});

// Request interceptor - Add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors and extract data
api.interceptors.response.use(
  (response) => {
    // Return the data directly for successful responses
    return response.data;
  },
  (error: AxiosError<any>) => {
    // Handle different error scenarios
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const data = error.response.data;

      if (status === 401) {
        // Unauthorized - clear auth and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (window.location.pathname !== '/') {
          window.location.href = '/';
        }
      }

      // Return the error response data
      return Promise.reject(data || { success: false, message: 'Request failed' });
    } else if (error.request) {
      // Request made but no response received
      console.error('No response received:', error.request);
      return Promise.reject({ 
        success: false, 
        message: 'No response from server. Please check your connection.' 
      });
    } else {
      // Error in request setup
      console.error('Request setup error:', error.message);
      return Promise.reject({ 
        success: false, 
        message: error.message || 'Request failed' 
      });
    }
  }
);

export default api;
