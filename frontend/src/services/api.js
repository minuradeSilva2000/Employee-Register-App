import axios from 'axios';
import toast from 'react-hot-toast';

// Create axios instance with default configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Try to refresh the token
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

            // Retry the original request with new token
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return api(originalRequest);
          }
        }
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Handle other errors
    const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
    
    // Don't show toast for 401 errors (handled above) or validation errors
    if (error.response?.status !== 401 && !error.response?.data?.errors) {
      toast.error(errorMessage);
    }

    return Promise.reject(error);
  }
);

// API service functions
export const authAPI = {
  // Login
  login: (credentials) => api.post('/auth/login', credentials),
  
  // Google OAuth
  googleVerify: (credential) => api.post('/auth/google/verify', { credential }),
  
  // Logout
  logout: () => api.post('/auth/logout'),
  
  // Refresh token
  refreshToken: (data) => api.post('/auth/refresh', data),
  
  // Verify token
  verifyToken: () => api.post('/auth/verify-token'),
  
  // Get current user
  getCurrentUser: () => api.get('/auth/me'),
  
  // Get permissions
  getPermissions: () => api.get('/auth/permissions'),
  
  // Change password
  changePassword: (data) => api.put('/auth/change-password', data),
  
  // Forgot password
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
};

export const userAPI = {
  // Get all users
  getAll: (params) => api.get('/users', { params }),
  
  // Get user by ID
  getById: (id) => api.get(`/users/${id}`),
  
  // Create user
  create: (data) => api.post('/users', data),
  
  // Update user
  update: (id, data) => api.put(`/users/${id}`, data),
  
  // Delete user
  delete: (id) => api.delete(`/users/${id}`),
  
  // Reset password
  resetPassword: (id, data) => api.post(`/users/${id}/reset-password`, data),
  
  // Get statistics
  getStatistics: () => api.get('/users/statistics'),
};

export const employeeAPI = {
  // Get all employees
  getAll: (params) => api.get('/employees', { params }),
  
  // Get employee by ID
  getById: (id) => api.get(`/employees/${id}`),
  
  // Create employee
  create: (data) => api.post('/employees', data),
  
  // Update employee
  update: (id, data) => api.put(`/employees/${id}`, data),
  
  // Delete employee
  delete: (id) => api.delete(`/employees/${id}`),
  
  // Get statistics
  getStatistics: () => api.get('/employees/statistics'),
  
  // Get department statistics
  getDepartmentStatistics: () => api.get('/employees/department-statistics'),
  
  // Search employees
  search: (params) => api.get('/employees/search', { params }),
};

export const departmentAPI = {
  // Get all departments
  getAll: (params) => api.get('/departments', { params }),
  
  // Get department by ID
  getById: (id) => api.get(`/departments/${id}`),
  
  // Create department
  create: (data) => api.post('/departments', data),
  
  // Update department
  update: (id, data) => api.put(`/departments/${id}`, data),
  
  // Delete department
  delete: (id) => api.delete(`/departments/${id}`),
  
  // Get statistics
  getStatistics: () => api.get('/departments/statistics'),
  
  // Get departments with employee count
  getWithEmployeeCount: () => api.get('/departments/with-employee-count'),
  
  // Search departments
  search: (params) => api.get('/departments/search', { params }),
};

export const jobTitleAPI = {
  // Get all job titles
  getAll: (params) => api.get('/job-titles', { params }),
  
  // Get job title by ID
  getById: (id) => api.get(`/job-titles/${id}`),
  
  // Create job title
  create: (data) => api.post('/job-titles', data),
  
  // Update job title
  update: (id, data) => api.put(`/job-titles/${id}`, data),
  
  // Delete job title
  delete: (id) => api.delete(`/job-titles/${id}`),
  
  // Get statistics
  getStatistics: () => api.get('/job-titles/statistics'),
  
  // Get job titles with employee count
  getWithEmployeeCount: () => api.get('/job-titles/with-employee-count'),
  
  // Get most popular job titles
  getMostPopular: (params) => api.get('/job-titles/most-popular', { params }),
  
  // Search job titles
  search: (params) => api.get('/job-titles/search', { params }),
};

export const attendanceAPI = {
  // Get all attendance records
  getAll: (params) => api.get('/attendance', { params }),
  
  // Get attendance by ID
  getById: (id) => api.get(`/attendance/${id}`),
  
  // Create attendance record
  create: (data) => api.post('/attendance', data),
  
  // Update attendance record
  update: (id, data) => api.put(`/attendance/${id}`, data),
  
  // Delete attendance record
  delete: (id) => api.delete(`/attendance/${id}`),
  
  // Get attendance for specific employee
  getByEmployee: (employeeId, params) => api.get(`/attendance/employee/${employeeId}`, { params }),
  
  // Get daily attendance summary
  getDailySummary: (date) => api.get(`/attendance/daily/${date}`),
  
  // Get monthly attendance report
  getMonthlyReport: (year, month) => api.get(`/attendance/monthly/${year}/${month}`),
  
  // Get attendance statistics
  getStatistics: (params) => api.get('/attendance/statistics', { params }),
  
  // Bulk check-in
  bulkCheckIn: (data) => api.post('/attendance/bulk-check-in', data),
};

export const dashboardAPI = {
  // Get overview statistics
  getOverview: () => api.get('/dashboard/overview'),
  
  // Get payment overview
  getPaymentOverview: () => api.get('/dashboard/payment-overview'),
  
  // Get attendance analytics
  getAttendanceAnalytics: (params) => api.get('/dashboard/attendance-analytics', { params }),
  
  // Get employee trends
  getEmployeeTrends: () => api.get('/dashboard/employee-trends'),
};

export const notificationAPI = {
  // Get all notifications
  getAll: (params) => api.get('/notifications', { params }),
  
  // Get unread notifications
  getUnread: (params) => api.get('/notifications/unread', { params }),
  
  // Get notification by ID
  getById: (id) => api.get(`/notifications/${id}`),
  
  // Mark notification as read
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  
  // Mark notification as unread
  markAsUnread: (id) => api.put(`/notifications/${id}/unread`),
  
  // Mark all notifications as read
  markAllAsRead: () => api.put('/notifications/mark-all-read'),
  
  // Delete notification
  delete: (id) => api.delete(`/notifications/${id}`),
  
  // Clean up old notifications
  cleanup: (params) => api.delete('/notifications/cleanup', { params }),
  
  // Get statistics
  getStatistics: () => api.get('/notifications/statistics'),
  
  // Create notification (admin only)
  create: (data) => api.post('/notifications', data),
  
  // Search notifications
  search: (params) => api.get('/notifications/search', { params }),
};

// Utility functions
export const apiUtils = {
  // Handle API errors consistently
  handleError: (error, customMessage = null) => {
    const message = customMessage || error.response?.data?.message || error.message || 'An error occurred';
    toast.error(message);
    return { success: false, error: message };
  },
  
  // Handle API success
  handleSuccess: (response, customMessage = null) => {
    const message = customMessage || response.message || 'Operation successful';
    if (message) toast.success(message);
    return { success: true, data: response.data };
  },
  
  // Format API parameters
  formatParams: (params) => {
    const formatted = {};
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        formatted[key] = params[key];
      }
    });
    return formatted;
  },
  
  // Create FormData for file uploads
  createFormData: (data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (data[key] !== undefined && data[key] !== null) {
        formData.append(key, data[key]);
      }
    });
    return formData;
  },
};

export default api;
