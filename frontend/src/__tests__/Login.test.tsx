/**
 * Login Component Tests
 * 
 * Tests the login navigation bug fix and ensures proper authentication flow
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import Login from '../pages/auth/Login';
import '@testing-library/jest-dom';

// Mock the navigation
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => ({ state: null }),
}));

// Mock the auth API
jest.mock('../services/api', () => ({
  authAPI: {
    login: jest.fn(),
    verifyToken: jest.fn(),
  },
}));

const renderLogin = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <Login />
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Login Component - Navigation Bug Fix', () => {
  beforeEach(() => {
    // Clear mocks before each test
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('Successful Login Flow', () => {
    it('should navigate to dashboard after successful login', async () => {
      const { authAPI } = require('../services/api');
      
      // Mock successful login response
      authAPI.login.mockResolvedValue({
        data: {
          success: true,
          data: {
            accessToken: 'mock-access-token',
            refreshToken: 'mock-refresh-token',
            user: {
              id: '1',
              name: 'Admin User',
              email: 'admin@example.com',
              role: 'Admin',
              permissions: ['read', 'write', 'delete'],
            },
          },
        },
      });

      renderLogin();

      // Fill in credentials
      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      
      fireEvent.change(emailInput, { target: { value: 'admin@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'Admin@123' } });

      // Submit form
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(submitButton);

      // Wait for navigation
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
      }, { timeout: 3000 });

      // Verify token is stored
      expect(localStorage.getItem('accessToken')).toBe('mock-access-token');
      expect(localStorage.getItem('refreshToken')).toBe('mock-refresh-token');
    });

    it('should wait for state update before navigation', async () => {
      const { authAPI } = require('../services/api');
      
      authAPI.login.mockResolvedValue({
        data: {
          success: true,
          data: {
            accessToken: 'mock-token',
            refreshToken: 'mock-refresh',
            user: {
              id: '1',
              name: 'Test User',
              email: 'test@example.com',
              role: 'Admin',
              permissions: [],
            },
          },
        },
      });

      renderLogin();

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(submitButton);

      // Navigation should not happen immediately
      expect(mockNavigate).not.toHaveBeenCalled();

      // Wait for delayed navigation
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalled();
      }, { timeout: 3000 });
    });
  });

  describe('Failed Login Flow', () => {
    it('should show error message for invalid credentials', async () => {
      const { authAPI } = require('../services/api');
      
      // Mock failed login response
      authAPI.login.mockRejectedValue({
        response: {
          data: {
            success: false,
            message: 'Invalid credentials',
          },
        },
      });

      renderLogin();

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      
      fireEvent.change(emailInput, { target: { value: 'invalid@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(submitButton);

      // Wait for error message
      await waitFor(() => {
        expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
      });

      // Verify password is cleared
      expect(passwordInput).toHaveValue('');

      // Verify no navigation occurred
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should clear password field on login failure', async () => {
      const { authAPI } = require('../services/api');
      
      authAPI.login.mockRejectedValue({
        response: {
          data: {
            success: false,
            message: 'Authentication failed',
          },
        },
      });

      renderLogin();

      const passwordInput = screen.getByLabelText(/^password$/i) as HTMLInputElement;
      
      fireEvent.change(passwordInput, { target: { value: 'testpassword' } });
      expect(passwordInput.value).toBe('testpassword');

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(submitButton);

      // Wait for password to be cleared
      await waitFor(() => {
        expect(passwordInput.value).toBe('');
      });
    });
  });

  describe('Form Validation', () => {
    it('should show validation error for empty email', async () => {
      renderLogin();

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      });
    });

    it('should show validation error for invalid email format', async () => {
      renderLogin();

      const emailInput = screen.getByLabelText(/email address/i);
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
      });
    });

    it('should show validation error for empty password', async () => {
      renderLogin();

      const emailInput = screen.getByLabelText(/email address/i);
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/password is required/i)).toBeInTheDocument();
      });
    });

    it('should clear field error when user starts typing', async () => {
      renderLogin();

      // Trigger validation error
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      });

      // Start typing in email field
      const emailInput = screen.getByLabelText(/email address/i);
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

      // Error should be cleared
      await waitFor(() => {
        expect(screen.queryByText(/email is required/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Demo Account Quick Fill', () => {
    it('should fill form with admin credentials when admin demo is clicked', () => {
      renderLogin();

      // Find and click admin demo account
      const adminDemo = screen.getByText(/admin account/i).closest('div');
      if (adminDemo) {
        fireEvent.click(adminDemo);
      }

      // Verify form is filled
      const emailInput = screen.getByLabelText(/email address/i) as HTMLInputElement;
      const passwordInput = screen.getByLabelText(/^password$/i) as HTMLInputElement;

      expect(emailInput.value).toBe('admin@example.com');
      expect(passwordInput.value).toBe('Admin@123');
    });
  });

  describe('Loading States', () => {
    it('should show loading state during login', async () => {
      const { authAPI } = require('../services/api');
      
      // Mock delayed response
      authAPI.login.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({
          data: {
            success: true,
            data: {
              accessToken: 'token',
              refreshToken: 'refresh',
              user: { id: '1', name: 'User', email: 'user@example.com', role: 'Admin', permissions: [] },
            },
          },
        }), 1000))
      );

      renderLogin();

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password' } });

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(submitButton);

      // Should show loading state
      await waitFor(() => {
        expect(screen.getByText(/signing in/i)).toBeInTheDocument();
      });

      // Form should be disabled
      expect(emailInput).toBeDisabled();
      expect(passwordInput).toBeDisabled();
      expect(submitButton).toBeDisabled();
    });
  });

  describe('Navigation Guard', () => {
    it('should verify token exists before navigation', async () => {
      const { authAPI } = require('../services/api');
      
      authAPI.login.mockResolvedValue({
        data: {
          success: true,
          data: {
            accessToken: 'test-token',
            refreshToken: 'test-refresh',
            user: {
              id: '1',
              name: 'Test',
              email: 'test@example.com',
              role: 'Admin',
              permissions: [],
            },
          },
        },
      });

      renderLogin();

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password' } });

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(submitButton);

      // Wait for navigation
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalled();
      }, { timeout: 3000 });

      // Verify token was checked
      expect(localStorage.getItem('accessToken')).toBeTruthy();
    });
  });
});
