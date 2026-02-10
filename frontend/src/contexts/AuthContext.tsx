/**
 * AuthContext - TypeScript Conversion
 * 
 * CHANGES MADE:
 * 1. Added proper TypeScript interfaces for state, actions, and context
 * 2. Typed all function parameters and return values
 * 3. Created AuthState interface for reducer state
 * 4. Created AuthAction union type for all possible actions
 * 5. Typed reducer function with proper action types
 * 6. Added proper typing for context value
 * 7. Converted all functions to use TypeScript types
 * 8. Added proper error typing
 * 
 * NO BEHAVIORAL CHANGES - All logic preserved exactly as-is
 */

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';
import { User, LoginCredentials, AuthResponse } from '../types';

// Extend Window interface for Google API
declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: {
          disableAutoSelect: () => void;
        };
      };
    };
  }
}

// ==================== INTERFACES ====================

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  permissions: string[];
}

interface GoogleAuthData {
  user: User;
  accessToken: string;
  refreshToken: string;
}

interface LoginResult {
  success: boolean;
  user?: User;
  error?: string;
}

interface TokenRefreshResult {
  success: boolean;
  error?: string;
}

interface AuthContextValue extends AuthState {
  login: (credentials: LoginCredentials) => Promise<LoginResult>;
  loginWithGoogle: (googleData: GoogleAuthData) => Promise<LoginResult>;
  setAuthData: (data: GoogleAuthData) => void;
  logout: () => Promise<void>;
  refreshToken: () => Promise<TokenRefreshResult>;
  loadUser: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  clearError: () => void;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
}

// ==================== ACTION TYPES ====================

const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  REFRESH_TOKEN_START: 'REFRESH_TOKEN_START',
  REFRESH_TOKEN_SUCCESS: 'REFRESH_TOKEN_SUCCESS',
  REFRESH_TOKEN_FAILURE: 'REFRESH_TOKEN_FAILURE',
  LOAD_USER_START: 'LOAD_USER_START',
  LOAD_USER_SUCCESS: 'LOAD_USER_SUCCESS',
  LOAD_USER_FAILURE: 'LOAD_USER_FAILURE',
  CLEAR_ERROR: 'CLEAR_ERROR',
  UPDATE_USER: 'UPDATE_USER',
} as const;

// Union type for all possible actions
type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User } }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'REFRESH_TOKEN_START' }
  | { type: 'REFRESH_TOKEN_SUCCESS'; payload: { user: User } }
  | { type: 'REFRESH_TOKEN_FAILURE'; payload: string }
  | { type: 'LOAD_USER_START' }
  | { type: 'LOAD_USER_SUCCESS'; payload: { user: User } }
  | { type: 'LOAD_USER_FAILURE'; payload: string }
  | { type: 'CLEAR_ERROR' }
  | { type: 'UPDATE_USER'; payload: Partial<User> };

// ==================== INITIAL STATE ====================

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  permissions: [],
};

// ==================== REDUCER ====================

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        permissions: action.payload.user.permissions || [],
      };

    case AUTH_ACTIONS.LOGIN_FAILURE:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
        permissions: [],
      };

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        permissions: [],
      };

    case AUTH_ACTIONS.REFRESH_TOKEN_START:
      return {
        ...state,
        isLoading: true,
      };

    case AUTH_ACTIONS.REFRESH_TOKEN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        permissions: action.payload.user.permissions || [],
      };

    case AUTH_ACTIONS.REFRESH_TOKEN_FAILURE:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
        permissions: [],
      };

    case AUTH_ACTIONS.LOAD_USER_START:
      return {
        ...state,
        isLoading: true,
      };

    case AUTH_ACTIONS.LOAD_USER_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        permissions: action.payload.user.permissions || [],
      };

    case AUTH_ACTIONS.LOAD_USER_FAILURE:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
        permissions: [],
      };

    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null,
      };

    default:
      return state;
  }
};

// ==================== CONTEXT ====================

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ==================== PROVIDER ====================

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Get tokens from localStorage
  const getTokens = (): { accessToken: string | null; refreshToken: string | null } => {
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    return { accessToken, refreshToken };
  };

  // Set tokens to localStorage
  const setTokens = (accessToken: string, refreshToken: string): void => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  };

  // Clear tokens from localStorage
  const clearTokens = (): void => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  };

  // Set auth data (for OAuth callbacks)
  const setAuthData = ({ user, accessToken, refreshToken }: GoogleAuthData): void => {
    setTokens(accessToken, refreshToken);
    dispatch({
      type: AUTH_ACTIONS.LOGIN_SUCCESS,
      payload: { user },
    });
  };

  // Google OAuth login
  const loginWithGoogle = async (googleData: GoogleAuthData): Promise<LoginResult> => {
    try {
      dispatch({ type: AUTH_ACTIONS.LOGIN_START });

      // Store access token in localStorage FIRST
      if (googleData.accessToken) {
        localStorage.setItem('accessToken', googleData.accessToken);
      }
      
      // Store refresh token if available
      if (googleData.refreshToken) {
        localStorage.setItem('refreshToken', googleData.refreshToken);
      }
      
      // Update state with user data AFTER tokens are stored
      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { user: googleData.user },
      });

      console.log('✅ Google login successful in AuthContext');
      
      // Return user data for navigation
      return { success: true, user: googleData.user };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Google login failed';
      
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: errorMessage,
      });

      console.error('❌ Google login error in AuthContext:', errorMessage);
      
      return { success: false, error: errorMessage };
    }
  };

  // Login function with proper error handling
  const login = async (credentials: LoginCredentials): Promise<LoginResult> => {
    try {
      dispatch({ type: AUTH_ACTIONS.LOGIN_START });

      console.log('🔵 Attempting login with:', credentials.email);

      // authAPI.login returns response.data directly (due to interceptor)
      const data = await authAPI.login(credentials) as any;
      
      console.log('🔍 Login response received:', { 
        success: data?.success, 
        hasData: !!data?.data,
        hasUser: !!data?.data?.user,
        hasToken: !!data?.data?.accessToken
      });
      
      if (data && data.success && data.data) {
        const { accessToken, refreshToken, user } = data.data;
        
        console.log('✅ Login successful, storing tokens...');
        
        // Store tokens FIRST
        setTokens(accessToken, refreshToken);
        
        // Update state AFTER tokens are stored
        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: { user },
        });

        toast.success(`Welcome back, ${user.name}!`);
        
        console.log('✅ Auth state updated, returning success');
        
        // Return user data for navigation
        return { success: true, user };
      } else {
        const errorMsg = data?.message || 'Invalid credentials';
        console.error('❌ Login failed - invalid response:', errorMsg);
        throw new Error(errorMsg);
      }
    } catch (error: any) {
      console.error('❌ Login error caught:', error);
      
      // Handle network errors
      if (error.isNetworkError || error.code === 'ERR_NETWORK' || !error.response) {
        const networkErrorMsg = 'Unable to connect to server. Please ensure the backend is running on port 5000.';
        console.error('❌ Network error:', networkErrorMsg);
        
        dispatch({
          type: AUTH_ACTIONS.LOGIN_FAILURE,
          payload: networkErrorMsg,
        });
        
        return { success: false, error: networkErrorMsg };
      }
      
      // Handle API errors
      const errorMessage = error.response?.data?.message || error.message || 'Invalid credentials';
      
      console.error('❌ API error:', errorMessage);
      
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: errorMessage,
      });
      
      return { success: false, error: errorMessage };
    }
  };

  // Logout function with complete session cleanup
  const logout = async (): Promise<void> => {
    try {
      const { refreshToken } = getTokens();
      
      if (refreshToken) {
        // Call logout API to invalidate refresh token
        await authAPI.logout();
      }

      // Revoke Google session if user logged in with Google
      if (window.google && window.google.accounts && window.google.accounts.id) {
        try {
          window.google.accounts.id.disableAutoSelect();
          console.log('✅ Google session revoked');
        } catch (error) {
          console.warn('⚠️ Failed to revoke Google session:', error);
        }
      }
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // Clear tokens and update state
      clearTokens();
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
      
      // Clear any cached data
      if (window.sessionStorage) {
        window.sessionStorage.clear();
      }
      
      // Show success message
      toast.success('Logged out successfully');
      
      // Force redirect to login page
      window.location.href = '/login';
    }
  };

  // Refresh token function
  const refreshToken = async (): Promise<TokenRefreshResult> => {
    try {
      const { refreshToken: token } = getTokens();
      
      if (!token) {
        throw new Error('No refresh token available');
      }

      dispatch({ type: AUTH_ACTIONS.REFRESH_TOKEN_START });

      const response = await authAPI.refreshToken({ refreshToken: token });
      const data: AuthResponse = response.data;
      
      if (data.success && data.data) {
        const { accessToken, user } = data.data;
        
        // Update access token
        localStorage.setItem('accessToken', accessToken);
        
        // Update state
        dispatch({
          type: AUTH_ACTIONS.REFRESH_TOKEN_SUCCESS,
          payload: { user },
        });

        return { success: true };
      } else {
        throw new Error(data.message || 'Token refresh failed');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Token refresh failed';
      
      // Clear tokens and update state
      clearTokens();
      dispatch({
        type: AUTH_ACTIONS.REFRESH_TOKEN_FAILURE,
        payload: errorMessage,
      });

      return { success: false, error: errorMessage };
    }
  };

  // Load user from token
  const loadUser = async (): Promise<void> => {
    try {
      const { accessToken } = getTokens();
      
      if (!accessToken) {
        throw new Error('No access token available');
      }

      dispatch({ type: AUTH_ACTIONS.LOAD_USER_START });

      const response = await authAPI.verifyToken();
      const data: AuthResponse = response.data;
      
      if (data.success && data.data) {
        dispatch({
          type: AUTH_ACTIONS.LOAD_USER_SUCCESS,
          payload: data.data,
        });
      } else {
        throw new Error(data.message || 'Token verification failed');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to load user';
      
      // Clear tokens and update state
      clearTokens();
      dispatch({
        type: AUTH_ACTIONS.LOAD_USER_FAILURE,
        payload: errorMessage,
      });
    }
  };

  // Update user profile
  const updateUser = (userData: Partial<User>): void => {
    dispatch({
      type: AUTH_ACTIONS.UPDATE_USER,
      payload: userData,
    });
  };

  // Clear error
  const clearError = (): void => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  // Check if user has specific permission
  const hasPermission = (permission: string): boolean => {
    return state.permissions.includes(permission);
  };

  // Check if user has any of the specified permissions
  const hasAnyPermission = (permissions: string[]): boolean => {
    return permissions.some(permission => state.permissions.includes(permission));
  };

  // Check if user has all specified permissions
  const hasAllPermissions = (permissions: string[]): boolean => {
    return permissions.every(permission => state.permissions.includes(permission));
  };

  // Check if user has specific role
  const hasRole = (role: string): boolean => {
    return state.user?.role === role;
  };

  // Check if user has any of the specified roles
  const hasAnyRole = (roles: string[]): boolean => {
    return state.user ? roles.includes(state.user.role) : false;
  };

  // Auto-logout on token expiry
  useEffect(() => {
    const { accessToken } = getTokens();
    
    if (accessToken) {
      try {
        // Decode JWT token to check expiry
        const tokenData = JSON.parse(atob(accessToken.split('.')[1]));
        const currentTime = Date.now() / 1000;
        
        // Auto-refresh token 5 minutes before expiry
        const timeUntilExpiry = tokenData.exp - currentTime;
        
        if (timeUntilExpiry > 0 && timeUntilExpiry < 300) {
          refreshToken();
        } else if (timeUntilExpiry <= 0) {
          logout();
        }
      } catch (error) {
        console.error('Token decode error:', error);
        logout();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.isAuthenticated]);

  // Load user on app start
  useEffect(() => {
    const { accessToken } = getTokens();
    
    if (accessToken) {
      loadUser();
    } else {
      dispatch({ type: AUTH_ACTIONS.LOAD_USER_FAILURE, payload: 'No token found' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value: AuthContextValue = {
    // State
    ...state,
    
    // Actions
    login,
    loginWithGoogle,
    setAuthData,
    logout,
    refreshToken,
    loadUser,
    updateUser,
    clearError,
    
    // Permission helpers
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasAnyRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// ==================== CUSTOM HOOK ====================

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default AuthContext;
