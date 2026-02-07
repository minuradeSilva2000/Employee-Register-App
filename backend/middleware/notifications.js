const Notification = require('../models/Notification');

/**
 * Notification Middleware
 * Handles real-time notification creation and delivery via Socket.io
 */

/**
 * Create and send notification
 * @param {Object} req - Express request object
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @param {Object} options - Additional notification options
 */
const createNotification = async (req, title, message, options = {}) => {
  try {
    const io = req.app.get('io');
    const userId = req.user?._id;
    const userRole = req.user?.role;
    
    let notifications = [];
    
    // Determine notification recipients
    if (options.userId) {
      // User-specific notification
      const notification = await Notification.createUserNotification(
        options.userId,
        title,
        message,
        {
          type: options.type || 'info',
          entityType: options.entityType || 'System',
          entityId: options.entityId,
          actionUrl: options.actionUrl,
          priority: options.priority || 'medium',
          metadata: {
            ...options.metadata,
            triggeredBy: userId,
            triggeredAt: new Date()
          }
        }
      );
      
      notifications.push(notification);
      
      // Send real-time notification to specific user
      if (io) {
        io.to(`user-${options.userId}`).emit('notification', {
          id: notification._id,
          title: notification.title,
          message: notification.message,
          type: notification.type,
          priority: notification.priority,
          actionUrl: notification.actionUrl,
          createdAt: notification.createdAt
        });
      }
    } else if (options.targetRole) {
      // Role-based notification
      notifications = await Notification.createRoleNotification(
        options.targetRole,
        title,
        message,
        {
          type: options.type || 'info',
          entityType: options.entityType || 'System',
          entityId: options.entityId,
          actionUrl: options.actionUrl,
          priority: options.priority || 'medium',
          metadata: {
            ...options.metadata,
            triggeredBy: userId,
            triggeredAt: new Date()
          }
        }
      );
      
      // Send real-time notification to role-based room
      if (io) {
        io.to(`role-${options.targetRole}`).emit('notification', {
          title,
          message,
          type: options.type || 'info',
          priority: options.priority || 'medium',
          actionUrl: options.actionUrl,
          createdAt: new Date()
        });
      }
    } else {
      // System-wide notification
      notifications = await Notification.createSystemNotification(
        title,
        message,
        {
          type: options.type || 'info',
          entityType: options.entityType || 'System',
          entityId: options.entityId,
          actionUrl: options.actionUrl,
          priority: options.priority || 'medium',
          metadata: {
            ...options.metadata,
            triggeredBy: userId,
            triggeredAt: new Date()
          }
        }
      );
      
      // Send real-time notification to all connected users
      if (io) {
        io.emit('notification', {
          title,
          message,
          type: options.type || 'info',
          priority: options.priority || 'medium',
          actionUrl: options.actionUrl,
          createdAt: new Date()
        });
      }
    }
    
    return notifications;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

/**
 * Middleware to automatically create notifications for CRUD operations
 */
const notificationMiddleware = {
  /**
   * Employee created notification
   */
  employeeCreated: async (req, employee) => {
    await createNotification(req, 
      'New Employee Added',
      `${employee.fullName} has been added as ${employee.jobTitle?.title || 'Employee'}`,
      {
        type: 'success',
        entityType: 'Employee',
        entityId: employee._id,
        actionUrl: '/employees',
        targetRole: 'HR', // Notify HR users
        metadata: {
          employeeId: employee.employeeId,
          department: employee.department?.name
        }
      }
    );
  },

  /**
   * Employee updated notification
   */
  employeeUpdated: async (req, employee, changes) => {
    const changeList = Object.keys(changes).join(', ');
    await createNotification(req,
      'Employee Updated',
      `${employee.fullName}'s information has been updated (${changeList})`,
      {
        type: 'info',
        entityType: 'Employee',
        entityId: employee._id,
        actionUrl: `/employees/${employee._id}`,
        targetRole: 'HR',
        metadata: {
          employeeId: employee.employeeId,
          changes
        }
      }
    );
  },

  /**
   * Employee deleted notification
   */
  employeeDeleted: async (req, employee) => {
    await createNotification(req,
      'Employee Removed',
      `${employee.fullName} has been removed from the system`,
      {
        type: 'warning',
        entityType: 'Employee',
        entityId: employee._id,
        targetRole: 'HR',
        metadata: {
          employeeId: employee.employeeId
        }
      }
    );
  },

  /**
   * Department created notification
   */
  departmentCreated: async (req, department) => {
    await createNotification(req,
      'New Department Created',
      `Department "${department.name}" has been created`,
      {
        type: 'success',
        entityType: 'Department',
        entityId: department._id,
        actionUrl: '/departments',
        targetRole: 'Admin',
        metadata: {
          departmentName: department.name
        }
      }
    );
  },

  /**
   * Department updated notification
   */
  departmentUpdated: async (req, department) => {
    await createNotification(req,
      'Department Updated',
      `Department "${department.name}" has been updated`,
      {
        type: 'info',
        entityType: 'Department',
        entityId: department._id,
        actionUrl: `/departments/${department._id}`,
        targetRole: 'Admin',
        metadata: {
          departmentName: department.name
        }
      }
    );
  },

  /**
   * Department deleted notification
   */
  departmentDeleted: async (req, department) => {
    await createNotification(req,
      'Department Deleted',
      `Department "${department.name}" has been deleted`,
      {
        type: 'warning',
        entityType: 'Department',
        entityId: department._id,
        targetRole: 'Admin',
        metadata: {
          departmentName: department.name
        }
      }
    );
  },

  /**
   * Job title created notification
   */
  jobTitleCreated: async (req, jobTitle) => {
    await createNotification(req,
      'New Job Title Created',
      `Job title "${jobTitle.title}" has been created`,
      {
        type: 'success',
        entityType: 'JobTitle',
        entityId: jobTitle._id,
        actionUrl: '/job-titles',
        targetRole: 'Admin',
        metadata: {
          jobTitle: jobTitle.title
        }
      }
    );
  },

  /**
   * Job title updated notification
   */
  jobTitleUpdated: async (req, jobTitle) => {
    await createNotification(req,
      'Job Title Updated',
      `Job title "${jobTitle.title}" has been updated`,
      {
        type: 'info',
        entityType: 'JobTitle',
        entityId: jobTitle._id,
        actionUrl: `/job-titles/${jobTitle._id}`,
        targetRole: 'Admin',
        metadata: {
          jobTitle: jobTitle.title
        }
      }
    );
  },

  /**
   * Job title deleted notification
   */
  jobTitleDeleted: async (req, jobTitle) => {
    await createNotification(req,
      'Job Title Deleted',
      `Job title "${jobTitle.title}" has been deleted`,
      {
        type: 'warning',
        entityType: 'JobTitle',
        entityId: jobTitle._id,
        targetRole: 'Admin',
        metadata: {
          jobTitle: jobTitle.title
        }
      }
    );
  },

  /**
   * Attendance marked notification
   */
  attendanceMarked: async (req, attendance) => {
    await createNotification(req,
      'Attendance Marked',
      `Attendance has been marked for ${attendance.employeeId?.fullName || 'Employee'}`,
      {
        type: 'success',
        entityType: 'Attendance',
        entityId: attendance._id,
        actionUrl: '/attendance',
        targetRole: 'HR',
        metadata: {
          date: attendance.date,
          status: attendance.status
        }
      }
    );
  },

  /**
   * User login notification (for security)
   */
  userLogin: async (req, user, isNewDevice = false) => {
    await createNotification(req,
      isNewDevice ? 'Login from New Device' : 'Login Successful',
      isNewDevice 
        ? `You logged in from a new device at ${new Date().toLocaleString()}`
        : `You successfully logged in at ${new Date().toLocaleString()}`,
      {
        type: isNewDevice ? 'warning' : 'info',
        entityType: 'User',
        entityId: user._id,
        userId: user._id,
        priority: isNewDevice ? 'high' : 'low',
        metadata: {
          ipAddress: req.ip,
          userAgent: req.get('User-Agent')
        }
      }
    );
  },

  /**
   * User role change notification
   */
  userRoleChanged: async (req, user, oldRole, newRole) => {
    await createNotification(req,
      'Role Updated',
      `Your role has been changed from ${oldRole} to ${newRole}`,
      {
        type: 'info',
        entityType: 'User',
        entityId: user._id,
        userId: user._id,
        priority: 'high',
        metadata: {
          oldRole,
          newRole
        }
      }
    );
  }
};

/**
 * Middleware to automatically trigger notifications based on request method and route
 */
const autoNotification = (req, res, next) => {
  // Store original res.json to intercept responses
  const originalJson = res.json;
  
  res.json = function(data) {
    // Only trigger notifications for successful operations
    if (data.success && req.method !== 'GET') {
      // Trigger notification based on route and method
      setTimeout(() => {
        handleAutoNotification(req, data);
      }, 0); // Async to avoid blocking response
    }
    
    return originalJson.call(this, data);
  };
  
  next();
};

/**
 * Handle automatic notification triggering
 */
const handleAutoNotification = async (req, responseData) => {
  try {
    const { method, originalUrl, user } = req;
    const { data } = responseData;
    
    // Only trigger for specific routes
    if (originalUrl.includes('/api/employees')) {
      if (method === 'POST' && data) {
        await notificationMiddleware.employeeCreated(req, data);
      } else if (method === 'PUT' && data) {
        await notificationMiddleware.employeeUpdated(req, data, req.body);
      } else if (method === 'DELETE') {
        await notificationMiddleware.employeeDeleted(req, req.employee);
      }
    } else if (originalUrl.includes('/api/departments')) {
      if (method === 'POST' && data) {
        await notificationMiddleware.departmentCreated(req, data);
      } else if (method === 'PUT' && data) {
        await notificationMiddleware.departmentUpdated(req, data);
      } else if (method === 'DELETE') {
        await notificationMiddleware.departmentDeleted(req, req.department);
      }
    } else if (originalUrl.includes('/api/job-titles')) {
      if (method === 'POST' && data) {
        await notificationMiddleware.jobTitleCreated(req, data);
      } else if (method === 'PUT' && data) {
        await notificationMiddleware.jobTitleUpdated(req, data);
      } else if (method === 'DELETE') {
        await notificationMiddleware.jobTitleDeleted(req, req.jobTitle);
      }
    } else if (originalUrl.includes('/api/attendance')) {
      if (method === 'POST' && data) {
        await notificationMiddleware.attendanceMarked(req, data);
      }
    }
  } catch (error) {
    console.error('Error in auto notification:', error);
  }
};

module.exports = {
  createNotification,
  notificationMiddleware,
  autoNotification
};
