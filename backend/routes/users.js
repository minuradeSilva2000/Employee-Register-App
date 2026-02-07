const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { authenticate, authorize } = require('../middleware/auth');
const { createNotification, notificationMiddleware } = require('../middleware/notifications');

const router = express.Router();

/**
 * @route   GET /api/users
 * @desc    Get all users (Admin only)
 * @access  Private (Admin)
 */
router.get('/', authenticate, authorize(['Admin']), async (req, res) => {
  try {
    const { page = 1, limit = 10, role, search, isActive } = req.query;
    
    // Build query
    const query = {};
    
    if (role) {
      query.role = role;
    }
    
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Execute query with pagination
    const users = await User.find(query)
      .select('-password -refreshToken')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    // Get total count
    const total = await User.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
    
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Private (Admin or own user)
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check authorization: Admin can access any user, others can only access their own profile
    if (req.userRole !== 'Admin' && req.userId !== id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own profile.'
      });
    }
    
    const user = await User.findById(id).select('-password -refreshToken');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      data: { user }
    });
    
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   POST /api/users
 * @desc    Create new user (Admin only)
 * @access  Private (Admin)
 */
router.post('/', [
  authenticate,
  authorize(['Admin']),
  [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Name is required')
      .isLength({ max: 100 })
      .withMessage('Name cannot exceed 100 characters'),
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    body('role')
      .isIn(['Admin', 'HR', 'Viewer'])
      .withMessage('Role must be Admin, HR, or Viewer')
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
    
    const { name, email, password, role } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }
    
    // Create new user
    const user = new User({
      name,
      email,
      password,
      role,
      createdBy: req.userId
    });
    
    await user.save();
    
    // Remove sensitive fields from response
    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.refreshToken;
    
    // Create notification
    await createNotification(req,
      'New User Created',
      `${name} has been added as ${role}`,
      {
        type: 'success',
        entityType: 'User',
        entityId: user._id,
        targetRole: 'Admin'
      }
    );
    
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: { user: userResponse }
    });
    
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   PUT /api/users/:id
 * @desc    Update user (Admin only, or own profile for limited fields)
 * @access  Private
 */
router.put('/:id', [
  authenticate,
  [
    body('name')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Name cannot be empty')
      .isLength({ max: 100 })
      .withMessage('Name cannot exceed 100 characters'),
    body('email')
      .optional()
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address'),
    body('role')
      .optional()
      .isIn(['Admin', 'HR', 'Viewer'])
      .withMessage('Role must be Admin, HR, or Viewer'),
    body('isActive')
      .optional()
      .isBoolean()
      .withMessage('isActive must be a boolean')
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
    
    const { id } = req.params;
    const updates = req.body;
    
    // Find user
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check authorization
    const isOwnProfile = req.userId === id;
    const isAdmin = req.userRole === 'Admin';
    
    if (!isOwnProfile && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    // Restrict field updates based on user role
    if (isOwnProfile && !isAdmin) {
      // Users can only update their own name and email
      const allowedFields = ['name', 'email'];
      const updateKeys = Object.keys(updates);
      const hasRestrictedFields = updateKeys.some(key => !allowedFields.includes(key));
      
      if (hasRestrictedFields) {
        return res.status(403).json({
          success: false,
          message: 'You can only update your name and email'
        });
      }
    }
    
    // Store old values for notification
    const oldValues = {
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive
    };
    
    // Check if email is being changed and if it's already taken
    if (updates.email && updates.email !== user.email) {
      const existingUser = await User.findOne({ email: updates.email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email is already in use by another user'
        });
      }
    }
    
    // Update user
    Object.assign(user, updates);
    user.updatedBy = req.userId;
    
    await user.save();
    
    // Remove sensitive fields from response
    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.refreshToken;
    
    // Create notifications for role changes
    if (updates.role && updates.role !== oldValues.role) {
      await notificationMiddleware.userRoleChanged(req, user, oldValues.role, updates.role);
    }
    
    // Create notification for user updates (Admin only)
    if (isAdmin && !isOwnProfile) {
      await createNotification(req,
        'User Updated',
        `${user.name}'s account has been updated`,
        {
          type: 'info',
          entityType: 'User',
          entityId: user._id,
          targetRole: 'Admin',
          metadata: {
            oldValues,
            newValues: updates
          }
        }
      );
    }
    
    res.json({
      success: true,
      message: 'User updated successfully',
      data: { user: userResponse }
    });
    
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user (Admin only, with restrictions)
 * @access  Private (Admin)
 */
router.delete('/:id', authenticate, authorize(['Admin']), async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find user
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Prevent self-deletion
    if (req.userId === id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account'
      });
    }
    
    // Check if this is the last admin
    if (user.role === 'Admin') {
      const adminCount = await User.countDocuments({ role: 'Admin', isActive: true });
      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete the last admin user'
        });
      }
    }
    
    // Soft delete by deactivating
    user.isActive = false;
    user.updatedBy = req.userId;
    
    await user.save();
    
    // Create notification
    await createNotification(req,
      'User Deactivated',
      `${user.name}'s account has been deactivated`,
      {
        type: 'warning',
        entityType: 'User',
        entityId: user._id,
        targetRole: 'Admin'
      }
    );
    
    res.json({
      success: true,
      message: 'User deactivated successfully'
    });
    
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   POST /api/users/:id/reset-password
 * @desc    Reset user password (Admin only)
 * @access  Private (Admin)
 */
router.post('/:id/reset-password', [
  authenticate,
  authorize(['Admin']),
  [
    body('newPassword')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
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
    
    const { id } = req.params;
    const { newPassword } = req.body;
    
    // Find user
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Update password
    user.password = newPassword;
    user.updatedBy = req.userId;
    
    await user.save();
    
    // Create notification
    await createNotification(req,
      'Password Reset',
      `Your password has been reset by an administrator`,
      {
        type: 'warning',
        entityType: 'User',
        entityId: user._id,
        userId: user._id,
        priority: 'high'
      }
    );
    
    res.json({
      success: true,
      message: 'Password reset successfully'
    });
    
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/users/statistics
 * @desc    Get user statistics
 * @access  Private (Admin)
 */
router.get('/statistics', authenticate, authorize(['Admin']), async (req, res) => {
  try {
    const statistics = await User.getStatistics();
    
    res.json({
      success: true,
      data: { statistics }
    });
    
  } catch (error) {
    console.error('Get user statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
