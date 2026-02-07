/**
 * JWT Utility Functions
 * Handles JWT token generation, verification, and management
 */

const jwt = require('jsonwebtoken');

// JWT Configuration
const JWT_CONFIG = {
  accessTokenExpiry: '15m',
  refreshTokenExpiry: '7d',
  issuer: 'employee-management-system',
  audience: 'employee-management-users'
};

/**
 * Generate Access Token
 * @param {Object} payload - User data to encode
 * @returns {string} - JWT access token
 */
const generateAccessToken = (payload) => {
  return jwt.sign(
    {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
      type: 'access'
    },
    process.env.JWT_SECRET,
    {
      expiresIn: JWT_CONFIG.accessTokenExpiry,
      issuer: JWT_CONFIG.issuer,
      audience: JWT_CONFIG.audience
    }
  );
};

/**
 * Generate Refresh Token
 * @param {Object} payload - User data to encode
 * @returns {string} - JWT refresh token
 */
const generateRefreshToken = (payload) => {
  return jwt.sign(
    {
      userId: payload.userId,
      type: 'refresh'
    },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: JWT_CONFIG.refreshTokenExpiry,
      issuer: JWT_CONFIG.issuer,
      audience: JWT_CONFIG.audience
    }
  );
};

/**
 * Verify Access Token
 * @param {string} token - JWT token to verify
 * @returns {Object} - Decoded token payload or error
 */
const verifyAccessToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      issuer: JWT_CONFIG.issuer,
      audience: JWT_CONFIG.audience
    });
    
    if (decoded.type !== 'access') {
      throw new Error('Invalid token type');
    }
    
    return { success: true, payload: decoded };
  } catch (error) {
    return { 
      success: false, 
      error: error.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token'
    };
  }
};

/**
 * Verify Refresh Token
 * @param {string} token - Refresh token to verify
 * @returns {Object} - Decoded token payload or error
 */
const verifyRefreshToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET, {
      issuer: JWT_CONFIG.issuer,
      audience: JWT_CONFIG.audience
    });
    
    if (decoded.type !== 'refresh') {
      throw new Error('Invalid token type');
    }
    
    return { success: true, payload: decoded };
  } catch (error) {
    return { 
      success: false, 
      error: error.name === 'TokenExpiredError' ? 'Refresh token expired' : 'Invalid refresh token'
    };
  }
};

/**
 * Generate Token Pair
 * @param {Object} user - User object
 * @returns {Object} - Access and refresh tokens
 */
const generateTokenPair = (user) => {
  const payload = {
    userId: user._id,
    email: user.email,
    role: user.role
  };
  
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload)
  };
};

/**
 * Set HTTP-Only Cookie Options
 * @param {boolean} isProduction - Environment flag
 * @returns {Object} - Cookie options
 */
const getCookieOptions = (isProduction = false) => {
  return {
    httpOnly: true,
    secure: isProduction, // HTTPS only in production
    sameSite: isProduction ? 'strict' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/'
  };
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  generateTokenPair,
  getCookieOptions,
  JWT_CONFIG
};