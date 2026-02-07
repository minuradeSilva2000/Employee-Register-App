const express = require('express');
const { body, validationResult } = require('express-validator');
const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');
const { authenticate, authorize } = require('../middleware/auth');
const { autoNotification } = require('../middleware/notifications');

const router = express.Router();

// Apply auto-notification middleware
router.use(autoNotification);

/**
 * @route   GET /api/attendance
 * @desc    Get attendance records with pagination and filtering
 * @access  Private (HR, Admin, Viewer)
 */
router.get('/', authenticate, authorize(['Admin', 'HR', 'Viewer']), async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      employeeId, 
      date, 
      startDate, 
      endDate, 
      status,
      sortBy = 'date', 
      sortOrder = 'desc' 
    } = req.query;
    
    // Build query
    const query = {};
    
    if (employeeId) {
      query.employeeId = employeeId;
    }
    
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      query.date = {
        $gte: startOfDay,
        $lte: endOfDay
      };
    }
    
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    if (status) {
      query.status = status;
    }
    
    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    // Execute query with pagination and population
    const attendance = await Attendance.find(query)
      .populate('employeeId', 'fullName employeeId')
      .populate('createdBy', 'name')
      .populate('updatedBy', 'name')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    // Get total count
    const total = await Attendance.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        attendance,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
    
  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/attendance/:id
 * @desc    Get attendance record by ID
 * @access  Private (HR, Admin, Viewer)
 */
router.get('/:id', authenticate, authorize(['Admin', 'HR', 'Viewer']), async (req, res) => {
  try {
    const { id } = req.params;
    
    const attendance = await Attendance.findById(id)
      .populate('employeeId', 'fullName employeeId email phone')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');
    
    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found'
      });
    }
    
    res.json({
      success: true,
      data: { attendance }
    });
    
  } catch (error) {
    console.error('Get attendance record error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   POST /api/attendance
 * @desc    Create new attendance record
 * @access  Private (HR, Admin)
 */
router.post('/', [
  authenticate,
  authorize(['Admin', 'HR'], ['attendance:create']),
  [
    body('employeeId')
      .isMongoId()
      .withMessage('Valid employee ID is required'),
    body('date')
      .isISO8601()
      .withMessage('Please provide a valid date')
      .custom((value) => {
        if (new Date(value) > new Date()) {
          throw new Error('Attendance date cannot be in the future');
        }
        return true;
      }),
    body('status')
      .isIn(['Present', 'Absent', 'Half Day', 'Leave'])
      .withMessage('Status must be Present, Absent, Half Day, or Leave'),
    body('checkInTime')
      .optional()
      .isISO8601()
      .withMessage('Please provide a valid check-in time'),
    body('checkOutTime')
      .optional()
      .isISO8601()
      .withMessage('Please provide a valid check-out time'),
    body('notes')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Notes cannot exceed 500 characters')
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
    
    const attendanceData = req.body;
    
    // Verify employee exists and is active
    const employee = await Employee.findById(attendanceData.employeeId);
    if (!employee) {
      return res.status(400).json({
        success: false,
        message: 'Employee not found'
      });
    }
    
    if (employee.status !== 'Active') {
      return res.status(400).json({
        success: false,
        message: 'Cannot mark attendance for inactive employee'
      });
    }
    
    // Check if attendance already exists for this employee and date
    const existingAttendance = await Attendance.findOne({
      employeeId: attendanceData.employeeId,
      date: new Date(attendanceData.date).toDateString()
    });
    
    if (existingAttendance) {
      return res.status(400).json({
        success: false,
        message: 'Attendance already exists for this employee on this date'
      });
    }
    
    // Validate check-in and check-out times
    if (attendanceData.checkInTime && attendanceData.checkOutTime) {
      const checkInTime = new Date(attendanceData.checkInTime);
      const checkOutTime = new Date(attendanceData.checkOutTime);
      const attendanceDate = new Date(attendanceData.date);
      
      if (checkInTime.toDateString() !== attendanceDate.toDateString()) {
        return res.status(400).json({
          success: false,
          message: 'Check-in time must be on the same day as attendance date'
        });
      }
      
      if (checkOutTime.toDateString() !== attendanceDate.toDateString()) {
        return res.status(400).json({
          success: false,
          message: 'Check-out time must be on the same day as attendance date'
        });
      }
      
      if (checkOutTime <= checkInTime) {
        return res.status(400).json({
          success: false,
          message: 'Check-out time must be after check-in time'
        });
      }
    }
    
    // Create new attendance record
    const attendance = new Attendance({
      ...attendanceData,
      date: new Date(attendanceData.date),
      createdBy: req.userId
    });
    
    await attendance.save();
    
    // Populate references for response
    await attendance.populate('employeeId', 'fullName employeeId');
    await attendance.populate('createdBy', 'name');
    
    res.status(201).json({
      success: true,
      message: 'Attendance record created successfully',
      data: { attendance }
    });
    
  } catch (error) {
    console.error('Create attendance error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Attendance already exists for this employee on this date'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   PUT /api/attendance/:id
 * @desc    Update attendance record
 * @access  Private (HR, Admin)
 */
router.put('/:id', [
  authenticate,
  authorize(['Admin', 'HR'], ['attendance:update']),
  [
    body('status')
      .optional()
      .isIn(['Present', 'Absent', 'Half Day', 'Leave'])
      .withMessage('Status must be Present, Absent, Half Day, or Leave'),
    body('checkInTime')
      .optional()
      .isISO8601()
      .withMessage('Please provide a valid check-in time'),
    body('checkOutTime')
      .optional()
      .isISO8601()
      .withMessage('Please provide a valid check-out time'),
    body('notes')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Notes cannot exceed 500 characters')
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
    
    // Find attendance record
    const attendance = await Attendance.findById(id);
    
    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found'
      });
    }
    
    // Validate check-in and check-out times if both are provided
    if (updates.checkInTime && updates.checkOutTime) {
      const checkInTime = new Date(updates.checkInTime);
      const checkOutTime = new Date(updates.checkOutTime);
      
      if (checkInTime.toDateString() !== attendance.date.toDateString()) {
        return res.status(400).json({
          success: false,
          message: 'Check-in time must be on the same day as attendance date'
        });
      }
      
      if (checkOutTime.toDateString() !== attendance.date.toDateString()) {
        return res.status(400).json({
          success: false,
          message: 'Check-out time must be on the same day as attendance date'
        });
      }
      
      if (checkOutTime <= checkInTime) {
        return res.status(400).json({
          success: false,
          message: 'Check-out time must be after check-in time'
        });
      }
    }
    
    // Update attendance record
    Object.assign(attendance, updates);
    attendance.updatedBy = req.userId;
    
    await attendance.save();
    
    // Populate references for response
    await attendance.populate('employeeId', 'fullName employeeId');
    await attendance.populate('createdBy', 'name');
    await attendance.populate('updatedBy', 'name');
    
    res.json({
      success: true,
      message: 'Attendance record updated successfully',
      data: { attendance }
    });
    
  } catch (error) {
    console.error('Update attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   DELETE /api/attendance/:id
 * @desc    Delete attendance record
 * @access  Private (HR, Admin)
 */
router.delete('/:id', authenticate, authorize(['Admin', 'HR'], ['attendance:delete']), async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find attendance record
    const attendance = await Attendance.findById(id);
    
    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found'
      });
    }
    
    // Soft delete attendance record
    await attendance.softDelete(req.userId);
    
    res.json({
      success: true,
      message: 'Attendance record deleted successfully'
    });
    
  } catch (error) {
    console.error('Delete attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/attendance/employee/:employeeId
 * @desc    Get attendance records for a specific employee
 * @access  Private (HR, Admin, Viewer)
 */
router.get('/employee/:employeeId', authenticate, authorize(['Admin', 'HR', 'Viewer']), async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { startDate, endDate } = req.query;
    
    // Verify employee exists
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }
    
    let start, end;
    if (startDate && endDate) {
      start = new Date(startDate);
      end = new Date(endDate);
    }
    
    const attendance = await Attendance.getByEmployee(employeeId, start, end);
    
    res.json({
      success: true,
      data: { attendance }
    });
    
  } catch (error) {
    console.error('Get employee attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/attendance/daily/:date
 * @desc    Get daily attendance summary
 * @access  Private (HR, Admin, Viewer)
 */
router.get('/daily/:date', authenticate, authorize(['Admin', 'HR', 'Viewer']), async (req, res) => {
  try {
    const { date } = req.params;
    
    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date is required'
      });
    }
    
    const dailySummary = await Attendance.getDailySummary(new Date(date));
    
    res.json({
      success: true,
      data: { dailySummary }
    });
    
  } catch (error) {
    console.error('Get daily attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/attendance/monthly/:year/:month
 * @desc    Get monthly attendance report
 * @access  Private (HR, Admin, Viewer)
 */
router.get('/monthly/:year/:month', authenticate, authorize(['Admin', 'HR', 'Viewer']), async (req, res) => {
  try {
    const { year, month } = req.params;
    
    const yearNum = parseInt(year);
    const monthNum = parseInt(month);
    
    if (isNaN(yearNum) || isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
      return res.status(400).json({
        success: false,
        message: 'Invalid year or month provided'
      });
    }
    
    const monthlyReport = await Attendance.getMonthlyReport(yearNum, monthNum);
    
    res.json({
      success: true,
      data: { monthlyReport }
    });
    
  } catch (error) {
    console.error('Get monthly attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/attendance/statistics
 * @desc    Get attendance statistics
 * @access  Private (HR, Admin, Viewer)
 */
router.get('/statistics', authenticate, authorize(['Admin', 'HR', 'Viewer']), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let start, end;
    if (startDate && endDate) {
      start = new Date(startDate);
      end = new Date(endDate);
    } else {
      // Default to last 30 days
      end = new Date();
      start = new Date();
      start.setDate(start.getDate() - 30);
    }
    
    const statistics = await Attendance.getStatistics(start, end);
    
    res.json({
      success: true,
      data: { statistics }
    });
    
  } catch (error) {
    console.error('Get attendance statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   POST /api/attendance/bulk-check-in
 * @desc    Bulk check-in for multiple employees
 * @access  Private (HR, Admin)
 */
router.post('/bulk-check-in', [
  authenticate,
  authorize(['Admin', 'HR'], ['attendance:create']),
  [
    body('date')
      .isISO8601()
      .withMessage('Please provide a valid date')
      .custom((value) => {
        if (new Date(value) > new Date()) {
          throw new Error('Attendance date cannot be in the future');
        }
        return true;
      }),
    body('employeeIds')
      .isArray({ min: 1 })
      .withMessage('At least one employee ID is required'),
    body('employeeIds.*')
      .isMongoId()
      .withMessage('Valid employee ID is required'),
    body('status')
      .isIn(['Present', 'Absent', 'Half Day', 'Leave'])
      .withMessage('Status must be Present, Absent, Half Day, or Leave')
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
    
    const { date, employeeIds, status, notes } = req.body;
    
    // Verify all employees exist and are active
    const employees = await Employee.find({ 
      _id: { $in: employeeIds },
      status: 'Active'
    });
    
    if (employees.length !== employeeIds.length) {
      return res.status(400).json({
        success: false,
        message: 'Some employees not found or are inactive'
      });
    }
    
    // Check for existing attendance records
    const existingRecords = await Attendance.find({
      employeeId: { $in: employeeIds },
      date: new Date(date).toDateString()
    });
    
    if (existingRecords.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Attendance already exists for some employees on this date'
      });
    }
    
    // Create bulk attendance records
    const attendanceRecords = employeeIds.map(employeeId => ({
      employeeId,
      date: new Date(date),
      status,
      notes,
      createdBy: req.userId
    }));
    
    const createdRecords = await Attendance.insertMany(attendanceRecords);
    
    // Populate references for response
    await Attendance.populate(createdRecords, {
      path: 'employeeId',
      select: 'fullName employeeId'
    });
    
    res.status(201).json({
      success: true,
      message: `${createdRecords.length} attendance records created successfully`,
      data: { attendance: createdRecords }
    });
    
  } catch (error) {
    console.error('Bulk check-in error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
