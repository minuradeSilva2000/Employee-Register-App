/**
 * Authentication Middleware
 * Protects routes and validates JWT tokens
 */

const { verifyAccessToken } = require('../utils/jwt');
const User = require('../models/User');

/**
 * Authenticate JWT Token
 * Middleware to verify access token and attach user to request
 */
const authenticate = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access token is required. Please provide a valid Bearer token.'
      });
    }
    
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // Verify access token
    const verificationResult = verifyAccessToken(token);
    
    if (!verificationResult.success) {
      return res.status(401).json({
        success: false,
        message: verificationResult.error,
        code: verificationResult.error === 'Token expired' ? 'TOKEN_EXPIRED' : 'INVALID_TOKEN'
      });
    }
    
    // Get user from database
    const user = await User.findById(verificationResult.payload.userId);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found. Token may be invalid.'
      });
    }
    
    // Check if user account is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account has been deactivated. Please contact support.'
      });
    }
    
    // Attach user information to request object
    req.user = user;
    req.userId = user._id;
    req.userRole = user.role;
    req.userPermissions = user.permissions;
    
    next();
    
  } catch (error) {
    console.error('❌ Authentication middleware error:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Internal server error during authentication'
    });
  }
};

/**
 * Optional Authentication
 * Middleware that doesn't require authentication but attaches user if token is valid
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(); // Continue without authentication
    }
    
    const token = authHeader.substring(7);
    const verificationResult = verifyAccessToken(token);
    
    if (verificationResult.success) {
      const user = await User.findById(verificationResult.payload.userId);
      
      if (user && user.isActive) {
        req.user = user;
        req.userId = user._id;
        req.userRole = user.role;
        req.userPermissions = user.permissions;
      }
    }
    
    next();
    
  } catch (error) {
    // Continue without authentication on error
    next();
  }
};

/**
 * Role-based Authorization
 * Middleware to check if user has required role(s)
 * @param {string|Array} roles - Required role(s)
 */
const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required to access this resource'
      });
    }
    
    // Convert single role to array
    const requiredRoles = Array.isArray(roles) ? roles : [roles];
    
    // Check if user has any of the required roles
    if (requiredRoles.length > 0 && !requiredRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role(s): ${requiredRoles.join(', ')}. Your role: ${req.user.role}`
      });
    }
    
    next();
  };
};

/**
 * Permission-based Authorization
 * Middleware to check if user has required permission(s)
 * @param {string|Array} permissions - Required permission(s)
 */
const requirePermissions = (permissions = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required to access this resource'
      });
    }
    
    // Convert single permission to array
    const requiredPermissions = Array.isArray(permissions) ? permissions : [permissions];
    
    // Check if user has all required permissions
    const userPermissions = req.userPermissions || [];
    const hasAllPermissions = requiredPermissions.every(
      permission => userPermissions.includes(permission)
    );
    
    if (requiredPermissions.length > 0 && !hasAllPermissions) {
      const missingPermissions = requiredPermissions.filter(
        permission => !userPermissions.includes(permission)
      );
      
      return res.status(403).json({
        success: false,
        message: `Access denied. Missing permissions: ${missingPermissions.join(', ')}`
      });
    }
    
    next();
  };
};

/**
 * Admin Only Access
 * Middleware to restrict access to Admin users only
 */
const adminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }
  
  if (req.user.role !== 'Admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }
  
  next();
};

/**
 * Self or Admin Access
 * Middleware to allow access to own resources or Admin users
 * @param {string} userIdParam - Parameter name containing user ID (default: 'id')
 */
const selfOrAdmin = (userIdParam = 'id') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    const targetUserId = req.params[userIdParam];
    const isOwner = req.user._id.toString() === targetUserId;
    const isAdmin = req.user.role === 'Admin';
    
    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only access your own resources or need Admin privileges.'
      });
    }
    
    next();
  };
};

module.exports = {
  authenticate,
  optionalAuth,
  authorize,
  requirePermissions,
  adminOnly,
  selfOrAdmin
};