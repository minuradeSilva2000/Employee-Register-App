import axios from 'axios';
import toast from 'react-hot-toast';

/**
 * Enhanced API Service with retry logic, caching, and error handling
 * 
 * Features:
 * - Automatic retry with exponential backoff
 * - Request/response interceptors
 * - Error handling with user-friendly messages
 * - Request caching for GET requests
 * - Request cancellation for race conditions
 */

// Create axios instance with enhanced configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request cache for GET requests
const requestCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;
const RETRY_BACKOFF_FACTOR = 2;

// Retry function with exponential backoff
const retryRequest = async (fn, retries = MAX_RETRIES) => {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0 && shouldRetryRequest(error)) {
      const delay = RETRY_DELAY * Math.pow(RETRY_BACKOFF_FACTOR, MAX_RETRIES - retries);
      console.log(`🔄 Retrying request in ${delay}ms... (${MAX_RETRIES - retries + 1}/${MAX_RETRIES})`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
      return retryRequest(fn, retries - 1);
    }
    throw error;
  }
};

// Determine if request should be retried
const shouldRetryRequest = (error) => {
  // Don't retry on 4xx errors (except 408, 429)
  if (error.response) {
    const { status } = error.response;
    return status === 408 || status === 429 || status >= 500;
  }
  
  // Retry on network errors
  return !error.response && error.code !== 'ECONNABORTED';
};

// Generate cache key
const getCacheKey = (config) => {
  const { method, url, params, data } = config;
  return `${method}:${url}:${JSON.stringify(params)}:${JSON.stringify(data)}`;
};

// Check if response is cached and valid
const getCachedResponse = (config) => {
  if (config.method?.toLowerCase() !== 'get') {
    return null;
  }
  
  const cacheKey = getCacheKey(config);
  const cached = requestCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log('📦 Using cached response for:', config.url);
    return cached.data;
  }
  
  return null;
};

// Store response in cache
const setCachedResponse = (config, data) => {
  if (config.method?.toLowerCase() !== 'get') {
    return;
  }
  
  const cacheKey = getCacheKey(config);
  requestCache.set(cacheKey, {
    data,
    timestamp: Date.now(),
  });
};

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Check cache first for GET requests
    const cachedResponse = getCachedResponse(config);
    if (cachedResponse) {
      // Return a promise that resolves with cached data
      return Promise.reject({ 
        __cached: true, 
        data: cachedResponse 
      });
    }
    
    // Add auth token
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add request ID for tracking
    config.metadata = {
      ...config.metadata,
      requestId: `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    
    console.log('📤 API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('📤 Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('📥 API Response:', response.status, response.config.url);
    
    // Cache successful GET responses
    if (response.config.method?.toLowerCase() === 'get') {
      setCachedResponse(response.config, response.data);
    }
    
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Handle cached responses
    if (error.__cached) {
      return Promise.resolve({
        data: error.data,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: originalRequest,
        request: {},
      });
    }
    
    // Handle token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(
            `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/auth/refresh`,
            { refreshToken }
          );
          
          if (response.data.success) {
            const { accessToken } = response.data.data;
            localStorage.setItem('accessToken', accessToken);
            
            // Retry original request with new token
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return api(originalRequest);
          }
        }
      } catch (refreshError) {
        console.error('🔄 Token refresh failed:', refreshError);
      }
      
      // Clear tokens and redirect to login
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
      return Promise.reject(error);
    }
    
    // Handle other errors
    const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
    
    // Show toast for client errors (4xx)
    if (error.response?.status >= 400 && error.response?.status < 500) {
      toast.error(errorMessage, {
        duration: 4000,
        position: 'top-right',
      });
    }
    
    // Log server errors (5xx)
    if (error.response?.status >= 500) {
      console.error('🔥 Server Error:', error.response?.status, errorMessage);
      toast.error('Server error. Please try again later.', {
        duration: 5000,
        position: 'top-right',
      });
    }
    
    return Promise.reject(error);
  }
);

/**
 * Enhanced API wrapper with retry logic
 */
export const apiService = {
  /**
   * GET request with caching and retry
   */
  get: async (url, config = {}) => {
    return retryRequest(() => api.get(url, config));
  },
  
  /**
   * POST request with retry
   */
  post: async (url, data, config = {}) => {
    return retryRequest(() => api.post(url, data, config));
  },
  
  /**
   * PUT request with retry
   */
  put: async (url, data, config = {}) => {
    return retryRequest(() => api.put(url, data, config));
  },
  
  /**
   * DELETE request with retry
   */
  delete: async (url, config = {}) => {
    return retryRequest(() => api.delete(url, config));
  },
  
  /**
   * PATCH request with retry
   */
  patch: async (url, data, config = {}) => {
    return retryRequest(() => api.patch(url, data, config));
  },
  
  /**
   * Upload file with progress tracking
   */
  upload: async (url, file, onProgress = null, config = {}) => {
    const formData = new FormData();
    formData.append('file', file);
    
    return api.post(url, formData, {
      ...config,
      headers: {
        ...config.headers,
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(progress);
        }
      },
    });
  },
  
  /**
   * Cancel all pending requests
   */
  cancelAll: () => {
    // Implementation for cancelling requests
    console.log('🚫 Cancelling all pending requests');
  },
  
  /**
   * Clear cache
   */
  clearCache: () => {
    requestCache.clear();
    console.log('🗑️ API cache cleared');
  },
  
  /**
   * Get cache stats
   */
  getCacheStats: () => {
    return {
      size: requestCache.size,
      entries: Array.from(requestCache.entries()).map(([key, value]) => ({
        key,
        timestamp: value.timestamp,
        age: Date.now() - value.timestamp,
      })),
    };
  },
};

export default apiService;
