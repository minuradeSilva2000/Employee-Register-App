const mongoose = require('mongoose');

/**
 * Notification Schema - Real-time Notification System
 * Handles user notifications with real-time delivery via Socket.io
 */
const notificationSchema = new mongoose.Schema({
  // Target user (null for system-wide notifications)
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  
  // Target role (null for user-specific notifications)
  targetRole: {
    type: String,
    enum: ['Admin', 'HR', 'Viewer'],
    default: null
  },
  
  title: {
    type: String,
    required: [true, 'Notification title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  
  message: {
    type: String,
    required: [true, 'Notification message is required'],
    trim: true,
    maxlength: [500, 'Message cannot exceed 500 characters']
  },
  
  type: {
    type: String,
    required: [true, 'Notification type is required'],
    enum: {
      values: ['info', 'success', 'warning', 'error'],
      message: 'Type must be info, success, warning, or error'
    },
    default: 'info'
  },
  
  // Related entity information
  entityType: {
    type: String,
    enum: ['Employee', 'Department', 'JobTitle', 'Attendance', 'User', 'System'],
    default: 'System'
  },
  
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },
  
  // Action URL (optional - for navigation)
  actionUrl: {
    type: String,
    default: null
  },
  
  // Read status
  isRead: {
    type: Boolean,
    default: false
  },
  
  readAt: {
    type: Date,
    default: null
  },
  
  // Auto-delete settings
  autoDelete: {
    type: Boolean,
    default: true
  },
  
  expiresAt: {
    type: Date,
    default: function() {
      // Default expiration: 30 days from creation
      const expiration = new Date();
      expiration.setDate(expiration.getDate() + 30);
      return expiration;
    }
  },
  
  // Priority level
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  
  // Additional metadata
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.__v;
      return ret;
    }
  }
});

/**
 * Indexes for performance
 */
notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ targetRole: 1, isRead: 1 });
notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ expiresAt: 1 });
notificationSchema.index({ entityType: 1, entityId: 1 });
notificationSchema.index({ priority: 1 });

/**
 * TTL index for auto-deletion of expired notifications
 */
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

/**
 * Pre-save middleware to set readAt when notification is marked as read
 */
notificationSchema.pre('save', function(next) {
  if (this.isModified('isRead') && this.isRead && !this.readAt) {
    this.readAt = new Date();
  }
  next();
});

/**
 * Instance method to mark notification as read
 */
notificationSchema.methods.markAsRead = function() {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

/**
 * Instance method to mark notification as unread
 */
notificationSchema.methods.markAsUnread = function() {
  this.isRead = false;
  this.readAt = null;
  return this.save();
};

/**
 * Static method to create notification for specific user
 * @param {string} userId - Target user ID
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} - Created notification
 */
notificationSchema.statics.createUserNotification = async function(userId, title, message, options = {}) {
  const notification = new this({
    userId,
    title,
    message,
    ...options
  });
  
  return await notification.save();
};

/**
 * Static method to create notification for specific role
 * @param {string} role - Target role
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @param {Object} options - Additional options
 * @returns {Promise<Array>} - Created notifications
 */
notificationSchema.statics.createRoleNotification = async function(role, title, message, options = {}) {
  const User = mongoose.model('User');
  const users = await User.find({ role, isActive: true });
  
  const notifications = users.map(user => ({
    userId: user._id,
    targetRole: role,
    title,
    message,
    ...options
  }));
  
  return await this.insertMany(notifications);
};

/**
 * Static method to create system-wide notification
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @param {Object} options - Additional options
 * @returns {Promise<Array>} - Created notifications
 */
notificationSchema.statics.createSystemNotification = async function(title, message, options = {}) {
  const User = mongoose.model('User');
  const users = await User.find({ isActive: true });
  
  const notifications = users.map(user => ({
    userId: user._id,
    title,
    message,
    type: 'info',
    ...options
  }));
  
  return await this.insertMany(notifications);
};

/**
 * Static method to get unread notifications for user
 * @param {string} userId - User ID
 * @param {number} limit - Limit results
 * @returns {Promise<Array>} - Unread notifications
 */
notificationSchema.statics.getUnreadForUser = function(userId, limit = 50) {
  return this.find({
    $or: [
      { userId },
      { targetRole: { $exists: true } }
    ],
    isRead: false
  })
  .sort({ createdAt: -1 })
  .limit(limit)
  .populate('userId', 'name email role');
};

/**
 * Static method to get all notifications for user
 * @param {string} userId - User ID
 * @param {Object} filters - Filter options
 * @returns {Promise<Array>} - Notifications
 */
notificationSchema.statics.getAllForUser = function(userId, filters = {}) {
  const query = {
    $or: [
      { userId },
      { targetRole: { $exists: true } }
    ]
  };
  
  if (filters.isRead !== undefined) {
    query.isRead = filters.isRead;
  }
  
  if (filters.type) {
    query.type = filters.type;
  }
  
  if (filters.priority) {
    query.priority = filters.priority;
  }
  
  return this.find(query)
    .sort({ createdAt: -1 })
    .limit(filters.limit || 100)
    .populate('userId', 'name email role');
};

/**
 * Static method to mark all notifications as read for user
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - Update result
 */
notificationSchema.statics.markAllAsReadForUser = function(userId) {
  return this.updateMany(
    {
      $or: [
        { userId },
        { targetRole: { $exists: true } }
      ],
      isRead: false
    },
    {
      isRead: true,
      readAt: new Date()
    }
  );
};

/**
 * Static method to get notification statistics for user
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - Notification statistics
 */
notificationSchema.statics.getStatisticsForUser = async function(userId) {
  const stats = await this.aggregate([
    {
      $match: {
        $or: [
          { userId },
          { targetRole: { $exists: true } }
        ]
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        unread: {
          $sum: { $cond: [{ $eq: ['$isRead', false] }, 1, 0] }
        },
        read: {
          $sum: { $cond: [{ $eq: ['$isRead', true] }, 1, 0] }
        },
        byType: {
          $push: {
            type: '$type',
            count: 1
          }
        },
        byPriority: {
          $push: {
            priority: '$priority',
            count: 1
          }
        }
      }
    }
  ]);
  
  const result = stats[0] || { total: 0, unread: 0, read: 0 };
  
  // Group by type
  if (result.byType) {
    result.typeBreakdown = {};
    result.byType.forEach(item => {
      result.typeBreakdown[item.type] = (result.typeBreakdown[item.type] || 0) + 1;
    });
    delete result.byType;
  }
  
  // Group by priority
  if (result.byPriority) {
    result.priorityBreakdown = {};
    result.byPriority.forEach(item => {
      result.priorityBreakdown[item.priority] = (result.priorityBreakdown[item.priority] || 0) + 1;
    });
    delete result.byPriority;
  }
  
  return result;
};

/**
 * Static method to cleanup old notifications
 * @param {number} daysOld - Delete notifications older than this many days
 * @returns {Promise<Object>} - Delete result
 */
notificationSchema.statics.cleanupOldNotifications = function(daysOld = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);
  
  return this.deleteMany({
    createdAt: { $lt: cutoffDate },
    autoDelete: true
  });
};

/**
 * Static method to search notifications
 * @param {string} userId - User ID
 * @param {string} searchTerm - Search term
 * @param {Object} filters - Additional filters
 * @returns {Promise<Array>} - Search results
 */
notificationSchema.statics.search = function(userId, searchTerm, filters = {}) {
  const query = {
    $or: [
      { userId },
      { targetRole: { $exists: true } }
    ]
  };
  
  if (searchTerm) {
    query.$and = [
      query.$or ? { $or: query.$or } : {},
      {
        $or: [
          { title: { $regex: searchTerm, $options: 'i' } },
          { message: { $regex: searchTerm, $options: 'i' } }
        ]
      }
    ];
    delete query.$or;
  }
  
  if (filters.isRead !== undefined) {
    query.isRead = filters.isRead;
  }
  
  if (filters.type) {
    query.type = filters.type;
  }
  
  if (filters.priority) {
    query.priority = filters.priority;
  }
  
  return this.find(query)
    .sort({ createdAt: -1 })
    .limit(filters.limit || 50)
    .populate('userId', 'name email role');
};

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
