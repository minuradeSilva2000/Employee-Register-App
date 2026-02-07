const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { 
  generateAccessToken, 
  generateRefreshToken, 
  authenticate, 
  refreshToken, 
  logout,
  authRateLimit 
} = require('../middleware/auth');
const { createNotification, notificationMiddleware } = require('../middleware/notifications');

const router = express.Router();

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user and get tokens
 * @access  Public
 */
router.post('/login', [
  authRateLimit,
  [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address'),
    body('password')
      .notEmpty()
      .withMessage('Password is required')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long')
  ]
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find user by email (include password field)
    const user = await User.findOne({ email }).select('+password +refreshToken');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account has been deactivated. Please contact administrator.'
      });
    }

    // Verify password
    const isPasswordValid = await user.correctPassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user._id, user.role);
    const refreshTokenValue = generateRefreshToken(user._id);

    // Save refresh token to user document
    user.refreshToken = refreshTokenValue;
    await user.save();

    // Update last login
    await user.updateLastLogin();

    // Create login notification (check if it's a new device)
    const isNewDevice = !user.lastLogin || 
      (Date.now() - new Date(user.lastLogin).getTime()) > 24 * 60 * 60 * 1000; // 24 hours

    await notificationMiddleware.userLogin(req, user, isNewDevice);

    // Get user permissions
    const userPermissions = user.permissions;

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        accessToken,
        refreshToken: refreshTokenValue,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          permissions: userPermissions,
          lastLogin: user.lastLogin
        }
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during login'
    });
  }
});

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
router.post('/refresh', refreshToken);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user and invalidate refresh token
 * @access  Private
 */
router.post('/logout', authenticate, logout);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          permissions: user.permissions,
          isActive: user.isActive,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt
        }
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   PUT /api/auth/change-password
 * @desc    Change user password
 * @access  Private
 */
router.put('/change-password', [
  authenticate,
  [
    body('currentPassword')
      .notEmpty()
      .withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 6 })
      .withMessage('New password must be at least 6 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number'),
    body('confirmPassword')
      .custom((value, { req }) => {
        if (value !== req.body.newPassword) {
          throw new Error('Password confirmation does not match');
        }
        return true;
      })
  ]
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await User.findById(req.userId).select('+password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await user.correctPassword(currentPassword);

    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Create notification
    await createNotification(req,
      'Password Changed',
      'Your password has been successfully changed',
      {
        type: 'success',
        entityType: 'User',
        entityId: user._id,
        userId: user._id
      }
    );

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   POST /api/auth/verify-token
 * @desc    Verify if access token is valid
 * @access  Private
 */
router.post('/verify-token', authenticate, (req, res) => {
  res.json({
    success: true,
    message: 'Token is valid',
    data: {
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        permissions: req.user.permissions
      }
    }
  });
});

/**
 * @route   GET /api/auth/permissions
 * @desc    Get user permissions
 * @access  Private
 */
router.get('/permissions', authenticate, (req, res) => {
  res.json({
    success: true,
    data: {
      permissions: req.user.permissions,
      role: req.user.role
    }
  });
});

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Initiate password reset (placeholder for future implementation)
 * @access  Public
 */
router.post('/forgot-password', [
  authRateLimit,
  [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address')
  ]
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ email });

    // Always return success to prevent email enumeration attacks
    if (!user) {
      return res.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.'
      });
    }

    // TODO: Implement actual password reset email functionality
    // For now, just return success message
    console.log(`Password reset requested for email: ${email}`);

    res.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
