const express = require('express');
const { body, validationResult } = require('express-validator');
const Notification = require('../models/Notification');
const { authenticate, authorize } = require('../middleware/auth');
const { createNotification } = require('../middleware/notifications');

const router = express.Router();

/**
 * @route   GET /api/notifications
 * @desc    Get notifications for the authenticated user
 * @access  Private
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      isRead, 
      type, 
      priority 
    } = req.query;
    
    // Build filters
    const filters = {};
    if (isRead !== undefined) {
      filters.isRead = isRead === 'true';
    }
    if (type) {
      filters.type = type;
    }
    if (priority) {
      filters.priority = priority;
    }
    filters.limit = parseInt(limit);
    
    const notifications = await Notification.getAllForUser(req.userId, filters);
    
    // Apply pagination manually since we're using a custom method
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedNotifications = notifications.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      data: {
        notifications: paginatedNotifications,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: notifications.length,
          pages: Math.ceil(notifications.length / limit)
        }
      }
    });
    
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/notifications/unread
 * @desc    Get unread notifications for the authenticated user
 * @access  Private
 */
router.get('/unread', authenticate, async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    
    const notifications = await Notification.getUnreadForUser(req.userId, parseInt(limit));
    
    res.json({
      success: true,
      data: { notifications }
    });
    
  } catch (error) {
    console.error('Get unread notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/notifications/:id
 * @desc    Get notification by ID
 * @access  Private
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    const notification = await Notification.findById(id)
      .populate('userId', 'name email role');
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }
    
    // Check if user has access to this notification
    const hasAccess = notification.userId 
      ? notification.userId._id.toString() === req.userId
      : true; // Role-based notifications are accessible to all
    
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    res.json({
      success: true,
      data: { notification }
    });
    
  } catch (error) {
    console.error('Get notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   PUT /api/notifications/:id/read
 * @desc    Mark notification as read
 * @access  Private
 */
router.put('/:id/read', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    const notification = await Notification.findById(id);
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }
    
    // Check if user has access to this notification
    const hasAccess = notification.userId 
      ? notification.userId.toString() === req.userId
      : true; // Role-based notifications are accessible to all
    
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    await notification.markAsRead();
    
    res.json({
      success: true,
      message: 'Notification marked as read',
      data: { notification }
    });
    
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   PUT /api/notifications/:id/unread
 * @desc    Mark notification as unread
 * @access  Private
 */
router.put('/:id/unread', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    const notification = await Notification.findById(id);
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }
    
    // Check if user has access to this notification
    const hasAccess = notification.userId 
      ? notification.userId.toString() === req.userId
      : true; // Role-based notifications are accessible to all
    
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    await notification.markAsUnread();
    
    res.json({
      success: true,
      message: 'Notification marked as unread',
      data: { notification }
    });
    
  } catch (error) {
    console.error('Mark notification as unread error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   PUT /api/notifications/mark-all-read
 * @desc    Mark all notifications as read for the user
 * @access  Private
 */
router.put('/mark-all-read', authenticate, async (req, res) => {
  try {
    const result = await Notification.markAllAsReadForUser(req.userId);
    
    res.json({
      success: true,
      message: 'All notifications marked as read',
      data: { 
        modifiedCount: result.modifiedCount 
      }
    });
    
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   DELETE /api/notifications/:id
 * @desc    Delete notification
 * @access  Private
 */
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    const notification = await Notification.findById(id);
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }
    
    // Check if user has access to this notification
    const hasAccess = notification.userId 
      ? notification.userId.toString() === req.userId
      : true; // Role-based notifications are accessible to all
    
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    await notification.remove();
    
    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });
    
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   DELETE /api/notifications/cleanup
 * @desc    Clean up old notifications
 * @access  Private (Admin only)
 */
router.delete('/cleanup', authenticate, authorize(['Admin']), async (req, res) => {
  try {
    const { daysOld = 30 } = req.query;
    
    const result = await Notification.cleanupOldNotifications(parseInt(daysOld));
    
    res.json({
      success: true,
      message: `Cleaned up ${result.deletedCount} old notifications`,
      data: { 
        deletedCount: result.deletedCount,
        daysOld: parseInt(daysOld)
      }
    });
    
  } catch (error) {
    console.error('Cleanup notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/notifications/statistics
 * @desc    Get notification statistics for the user
 * @access  Private
 */
router.get('/statistics', authenticate, async (req, res) => {
  try {
    const statistics = await Notification.getStatisticsForUser(req.userId);
    
    res.json({
      success: true,
      data: { statistics }
    });
    
  } catch (error) {
    console.error('Get notification statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   POST /api/notifications
 * @desc    Create a new notification (Admin only)
 * @access  Private (Admin)
 */
router.post('/', [
  authenticate,
  authorize(['Admin']),
  [
    body('title')
      .trim()
      .notEmpty()
      .withMessage('Title is required')
      .isLength({ max: 100 })
      .withMessage('Title cannot exceed 100 characters'),
    body('message')
      .trim()
      .notEmpty()
      .withMessage('Message is required')
      .isLength({ max: 500 })
      .withMessage('Message cannot exceed 500 characters'),
    body('type')
      .optional()
      .isIn(['info', 'success', 'warning', 'error'])
      .withMessage('Type must be info, success, warning, or error'),
    body('priority')
      .optional()
      .isIn(['low', 'medium', 'high', 'urgent'])
      .withMessage('Priority must be low, medium, high, or urgent'),
    body('userId')
      .optional()
      .isMongoId()
      .withMessage('Valid user ID is required'),
    body('targetRole')
      .optional()
      .isIn(['Admin', 'HR', 'Viewer'])
      .withMessage('Target role must be Admin, HR, or Viewer'),
    body('actionUrl')
      .optional()
      .isURL()
      .withMessage('Action URL must be a valid URL')
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
    
    const { title, message, type = 'info', priority = 'medium', userId, targetRole, actionUrl } = req.body;
    
    // Validate that either userId or targetRole is provided, but not both
    if (userId && targetRole) {
      return res.status(400).json({
        success: false,
        message: 'Cannot specify both userId and targetRole'
      });
    }
    
    if (!userId && !targetRole) {
      return res.status(400).json({
        success: false,
        message: 'Either userId or targetRole must be specified'
      });
    }
    
    // Create notification options
    const options = {
      type,
      priority,
      actionUrl,
      entityType: 'System'
    };
    
    let notifications;
    
    if (userId) {
      // Create user-specific notification
      notifications = await createNotification(req, title, message, {
        ...options,
        userId
      });
    } else {
      // Create role-based notification
      notifications = await createNotification(req, title, message, {
        ...options,
        targetRole
      });
    }
    
    res.status(201).json({
      success: true,
      message: 'Notification created successfully',
      data: { 
        notifications: Array.isArray(notifications) ? notifications : [notifications]
      }
    });
    
  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/notifications/search
 * @desc    Search notifications
 * @access  Private
 */
router.get('/search', authenticate, async (req, res) => {
  try {
    const { q: searchTerm, type, priority, isRead, limit = 50 } = req.query;
    
    if (!searchTerm) {
      return res.status(400).json({
        success: false,
        message: 'Search term is required'
      });
    }
    
    const filters = {};
    if (type) filters.type = type;
    if (priority) filters.priority = priority;
    if (isRead !== undefined) filters.isRead = isRead === 'true';
    filters.limit = parseInt(limit);
    
    const notifications = await Notification.search(req.userId, searchTerm, filters);
    
    res.json({
      success: true,
      data: { notifications }
    });
    
  } catch (error) {
    console.error('Search notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
