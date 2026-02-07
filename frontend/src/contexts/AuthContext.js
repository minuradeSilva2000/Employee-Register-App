import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

// Initial state
const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  permissions: [],
};

// Action types
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
};

// Reducer function
const authReducer = (state, action) => {
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
        user: { ...state.user, ...action.payload },
      };

    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Get tokens from localStorage
  const getTokens = () => {
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    return { accessToken, refreshToken };
  };

  // Set tokens to localStorage
  const setTokens = (accessToken, refreshToken) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  };

  // Clear tokens from localStorage
  const clearTokens = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  };

  // Set auth data (for OAuth callbacks)
  const setAuthData = ({ user, accessToken, refreshToken }) => {
    setTokens(accessToken, refreshToken);
    dispatch({
      type: AUTH_ACTIONS.LOGIN_SUCCESS,
      payload: { user },
    });
  };

  // Google OAuth login
  const loginWithGoogle = async (googleData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.LOGIN_START });

      // Store access token in localStorage
      if (googleData.accessToken) {
        localStorage.setItem('accessToken', googleData.accessToken);
      }
      
      // Update state with user data
      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { user: googleData.user },
      });

      console.log('✅ Google login successful in AuthContext');
      
      return { success: true, user: googleData.user };
    } catch (error) {
      const errorMessage = error.message || 'Google login failed';
      
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: errorMessage,
      });

      console.error('❌ Google login error in AuthContext:', errorMessage);
      
      return { success: false, error: errorMessage };
    }
  };

  // Login function
  const login = async (credentials) => {
    try {
      dispatch({ type: AUTH_ACTIONS.LOGIN_START });

      const response = await authAPI.login(credentials);
      
      if (response.success) {
        const { accessToken, refreshToken, user } = response.data;
        
        // Store tokens
        setTokens(accessToken, refreshToken);
        
        // Update state
        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: { user },
        });

        toast.success(`Welcome back, ${user.name}!`);
        
        return { success: true, user };
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: errorMessage,
      });

      toast.error(errorMessage);
      
      return { success: false, error: errorMessage };
    }
  };

  // Logout function
  const logout = async () => {
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
      // Continue with logout even if API call fails
      console.error('Logout API error:', error);
    } finally {
      // Clear tokens and update state
      clearTokens();
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
      toast.success('Logged out successfully');
    }
  };

  // Refresh token function
  const refreshToken = async () => {
    try {
      const { refreshToken: token } = getTokens();
      
      if (!token) {
        throw new Error('No refresh token available');
      }

      dispatch({ type: AUTH_ACTIONS.REFRESH_TOKEN_START });

      const response = await authAPI.refreshToken({ refreshToken: token });
      
      if (response.success) {
        const { accessToken, user } = response.data;
        
        // Update access token
        localStorage.setItem('accessToken', accessToken);
        
        // Update state
        dispatch({
          type: AUTH_ACTIONS.REFRESH_TOKEN_SUCCESS,
          payload: { user },
        });

        return { success: true };
      } else {
        throw new Error(response.message || 'Token refresh failed');
      }
    } catch (error) {
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
  const loadUser = async () => {
    try {
      const { accessToken } = getTokens();
      
      if (!accessToken) {
        throw new Error('No access token available');
      }

      dispatch({ type: AUTH_ACTIONS.LOAD_USER_START });

      const response = await authAPI.verifyToken();
      
      if (response.success) {
        dispatch({
          type: AUTH_ACTIONS.LOAD_USER_SUCCESS,
          payload: response.data,
        });
      } else {
        throw new Error(response.message || 'Token verification failed');
      }
    } catch (error) {
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
  const updateUser = (userData) => {
    dispatch({
      type: AUTH_ACTIONS.UPDATE_USER,
      payload: userData,
    });
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  // Check if user has specific permission
  const hasPermission = (permission) => {
    return state.permissions.includes(permission);
  };

  // Check if user has any of the specified permissions
  const hasAnyPermission = (permissions) => {
    return permissions.some(permission => state.permissions.includes(permission));
  };

  // Check if user has all specified permissions
  const hasAllPermissions = (permissions) => {
    return permissions.every(permission => state.permissions.includes(permission));
  };

  // Check if user has specific role
  const hasRole = (role) => {
    return state.user?.role === role;
  };

  // Check if user has any of the specified roles
  const hasAnyRole = (roles) => {
    return roles.includes(state.user?.role);
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
  }, [state.isAuthenticated]);

  // Load user on app start
  useEffect(() => {
    const { accessToken } = getTokens();
    
    if (accessToken) {
      loadUser();
    } else {
      dispatch({ type: AUTH_ACTIONS.LOAD_USER_FAILURE, payload: 'No token found' });
    }
  }, []);

  const value = {
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

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default AuthContext;
