const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Notification = require('../models/Notification');

/**
 * Authentication Middleware
 * Protects routes by verifying JWT tokens and setting user context
 */

/**
 * Generate JWT Access Token
 * @param {string} userId - User ID
 * @param {string} role - User role
 * @returns {string} - JWT access token
 */
const generateAccessToken = (userId, role) => {
  return jwt.sign(
    { 
      userId, 
      role,
      type: 'access'
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE || '15m'
    }
  );
};

/**
 * Generate JWT Refresh Token
 * @param {string} userId - User ID
 * @returns {string} - JWT refresh token
 */
const generateRefreshToken = (userId) => {
  return jwt.sign(
    { 
      userId,
      type: 'refresh'
    },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d'
    }
  );
};

/**
 * Verify JWT Access Token
 * @param {string} token - JWT token
 * @returns {Object} - Decoded token payload
 */
const verifyAccessToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

/**
 * Verify JWT Refresh Token
 * @param {string} token - Refresh token
 * @returns {Object} - Decoded token payload
 */
const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
};

/**
 * Authentication Middleware
 * Verifies JWT token and attaches user to request object
 */
const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }
    
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // Verify token
    const decoded = verifyAccessToken(token);
    
    // Check if token type is access
    if (decoded.type !== 'access') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token type.'
      });
    }
    
    // Get user from database
    const user = await User.findById(decoded.userId).select('+refreshToken');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. User not found.'
      });
    }
    
    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account has been deactivated.'
      });
    }
    
    // Attach user to request object
    req.user = user;
    req.userId = user._id;
    req.userRole = user.role;
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired.',
        code: 'TOKEN_EXPIRED'
      });
    }
    
    console.error('Authentication error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during authentication.'
    });
  }
};

/**
 * Authorization Middleware
 * Checks if user has required role or permission
 * @param {string|Array} roles - Required role(s)
 * @param {string|Array} permissions - Required permission(s)
 */
const authorize = (roles = [], permissions = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }
    
    // Check role-based authorization
    if (roles.length > 0) {
      const userRole = req.user.role;
      const hasRole = Array.isArray(roles) 
        ? roles.includes(userRole)
        : userRole === roles;
      
      if (!hasRole) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Insufficient role permissions.'
        });
      }
    }
    
    // Check permission-based authorization
    if (permissions.length > 0) {
      const userPermissions = req.user.permissions || [];
      const hasPermission = Array.isArray(permissions)
        ? permissions.every(permission => userPermissions.includes(permission))
        : userPermissions.includes(permissions);
      
      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Insufficient permissions.'
        });
      }
    }
    
    next();
  };
};

/**
 * Optional Authentication Middleware
 * Attaches user to request if token is present, but doesn't require it
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }
    
    const token = authHeader.substring(7);
    const decoded = verifyAccessToken(token);
    
    if (decoded.type !== 'access') {
      return next();
    }
    
    const user = await User.findById(decoded.userId).select('+refreshToken');
    
    if (user && user.isActive) {
      req.user = user;
      req.userId = user._id;
      req.userRole = user.role;
    }
    
    next();
  } catch (error) {
    // Silently ignore authentication errors for optional auth
    next();
  }
};

/**
 * Refresh Token Middleware
 * Handles token refresh logic
 */
const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token required.'
      });
    }
    
    // Verify refresh token
    const decoded = verifyRefreshToken(token);
    
    if (decoded.type !== 'refresh') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token type.'
      });
    }
    
    // Get user from database
    const user = await User.findById(decoded.userId).select('+refreshToken');
    
    if (!user || !user.refreshToken || user.refreshToken !== token) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token.'
      });
    }
    
    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account has been deactivated.'
      });
    }
    
    // Generate new access token
    const accessToken = generateAccessToken(user._id, user.role);
    
    // Update last login
    await user.updateLastLogin();
    
    res.json({
      success: true,
      message: 'Token refreshed successfully.',
      data: {
        accessToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          permissions: user.permissions
        }
      }
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token.'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Refresh token expired. Please login again.'
      });
    }
    
    console.error('Token refresh error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during token refresh.'
    });
  }
};

/**
 * Logout Middleware
 * Invalidates refresh token
 */
const logout = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }
    
    // Clear refresh token
    req.user.refreshToken = undefined;
    await req.user.save();
    
    // Create logout notification
    await Notification.createUserNotification(
      req.user._id,
      'Logged Out',
      'You have been successfully logged out.',
      {
        type: 'info',
        entityType: 'User',
        entityId: req.user._id
      }
    );
    
    res.json({
      success: true,
      message: 'Logged out successfully.'
    });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during logout.'
    });
  }
};

/**
 * Rate Limiting for Authentication
 * Prevents brute force attacks
 */
const authRateLimit = (req, res, next) => {
  // This would typically use a rate limiting library like express-rate-limit
  // For now, we'll add a simple delay to slow down potential attacks
  const delay = Math.random() * 100; // Random delay up to 100ms
  
  setTimeout(() => {
    next();
  }, delay);
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  authenticate,
  authorize,
  optionalAuth,
  refreshToken,
  logout,
  authRateLimit
};
