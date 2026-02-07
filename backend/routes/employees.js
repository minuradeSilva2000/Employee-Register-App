const express = require('express');
const { body, validationResult } = require('express-validator');
const Employee = require('../models/Employee');
const Department = require('../models/Department');
const JobTitle = require('../models/JobTitle');
const { authenticate, authorize } = require('../middleware/auth');
const { autoNotification } = require('../middleware/notifications');

const router = express.Router();

// Apply auto-notification middleware
router.use(autoNotification);

/**
 * @route   GET /api/employees
 * @desc    Get all employees with pagination, filtering, and search
 * @access  Private (HR, Admin, Viewer)
 */
router.get('/', authenticate, authorize(['Admin', 'HR', 'Viewer']), async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      department, 
      jobTitle, 
      status, 
      sortBy = 'createdAt', 
      sortOrder = 'desc' 
    } = req.query;
    
    // Build query
    const query = {};
    
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (department) {
      query.department = department;
    }
    
    if (jobTitle) {
      query.jobTitle = jobTitle;
    }
    
    if (status) {
      query.status = status;
    }
    
    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    // Execute query with pagination and population
    const employees = await Employee.find(query)
      .populate('department', 'name')
      .populate('jobTitle', 'title')
      .populate('createdBy', 'name')
      .populate('updatedBy', 'name')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    // Get total count
    const total = await Employee.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        employees,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
    
  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/employees/:id
 * @desc    Get employee by ID
 * @access  Private (HR, Admin, Viewer)
 */
router.get('/:id', authenticate, authorize(['Admin', 'HR', 'Viewer']), async (req, res) => {
  try {
    const { id } = req.params;
    
    const employee = await Employee.findById(id)
      .populate('department', 'name description')
      .populate('jobTitle', 'title description')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');
    
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }
    
    res.json({
      success: true,
      data: { employee }
    });
    
  } catch (error) {
    console.error('Get employee error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   POST /api/employees
 * @desc    Create new employee
 * @access  Private (Admin, HR)
 */
router.post('/', [
  authenticate,
  authorize(['Admin', 'HR'], ['employees:create']),
  [
    body('fullName')
      .trim()
      .notEmpty()
      .withMessage('Full name is required')
      .isLength({ max: 100 })
      .withMessage('Full name cannot exceed 100 characters'),
    body('NIC')
      .trim()
      .notEmpty()
      .withMessage('NIC is required')
      .matches(/^\d{9}[Vv]$/)
      .withMessage('NIC must be in format 123456789V'),
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address'),
    body('phone')
      .trim()
      .notEmpty()
      .withMessage('Phone number is required')
      .matches(/^\+?[\d\s-()]+$/)
      .withMessage('Please provide a valid phone number'),
    body('address')
      .trim()
      .notEmpty()
      .withMessage('Address is required')
      .isLength({ max: 200 })
      .withMessage('Address cannot exceed 200 characters'),
    body('jobTitle')
      .isMongoId()
      .withMessage('Valid job title ID is required'),
    body('department')
      .isMongoId()
      .withMessage('Valid department ID is required'),
    body('salary')
      .isNumeric()
      .withMessage('Salary must be a number')
      .isFloat({ min: 0, max: 1000000 })
      .withMessage('Salary must be between 0 and 1,000,000'),
    body('dateJoined')
      .isISO8601()
      .withMessage('Please provide a valid date')
      .custom((value) => {
        if (new Date(value) > new Date()) {
          throw new Error('Date joined cannot be in the future');
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
    
    const employeeData = req.body;
    
    // Check if email already exists
    const existingEmployee = await Employee.findOne({ email: employeeData.email });
    if (existingEmployee) {
      return res.status(400).json({
        success: false,
        message: 'Employee with this email already exists'
      });
    }
    
    // Check if NIC already exists
    const existingNIC = await Employee.findOne({ NIC: employeeData.NIC });
    if (existingNIC) {
      return res.status(400).json({
        success: false,
        message: 'Employee with this NIC already exists'
      });
    }
    
    // Verify department exists
    const department = await Department.findById(employeeData.department);
    if (!department) {
      return res.status(400).json({
        success: false,
        message: 'Department not found'
      });
    }
    
    // Verify job title exists
    const jobTitle = await JobTitle.findById(employeeData.jobTitle);
    if (!jobTitle) {
      return res.status(400).json({
        success: false,
        message: 'Job title not found'
      });
    }
    
    // Create new employee
    const employee = new Employee({
      ...employeeData,
      createdBy: req.userId
    });
    
    await employee.save();
    
    // Populate references for response
    await employee.populate('department', 'name');
    await employee.populate('jobTitle', 'title');
    await employee.populate('createdBy', 'name');
    
    // Store employee for notification middleware
    req.employee = employee;
    
    res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      data: { employee }
    });
    
  } catch (error) {
    console.error('Create employee error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   PUT /api/employees/:id
 * @desc    Update employee
 * @access  Private (Admin, HR)
 */
router.put('/:id', [
  authenticate,
  authorize(['Admin', 'HR'], ['employees:update']),
  [
    body('fullName')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Full name cannot be empty')
      .isLength({ max: 100 })
      .withMessage('Full name cannot exceed 100 characters'),
    body('email')
      .optional()
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address'),
    body('phone')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Phone number cannot be empty')
      .matches(/^\+?[\d\s-()]+$/)
      .withMessage('Please provide a valid phone number'),
    body('address')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Address cannot be empty')
      .isLength({ max: 200 })
      .withMessage('Address cannot exceed 200 characters'),
    body('jobTitle')
      .optional()
      .isMongoId()
      .withMessage('Valid job title ID is required'),
    body('department')
      .optional()
      .isMongoId()
      .withMessage('Valid department ID is required'),
    body('salary')
      .optional()
      .isNumeric()
      .withMessage('Salary must be a number')
      .isFloat({ min: 0, max: 1000000 })
      .withMessage('Salary must be between 0 and 1,000,000'),
    body('status')
      .optional()
      .isIn(['Active', 'Resigned'])
      .withMessage('Status must be Active or Resigned')
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
    
    // Find employee
    const employee = await Employee.findById(id);
    
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }
    
    // Check if email is being changed and if it's already taken
    if (updates.email && updates.email !== employee.email) {
      const existingEmployee = await Employee.findOne({ email: updates.email });
      if (existingEmployee) {
        return res.status(400).json({
          success: false,
          message: 'Email is already in use by another employee'
        });
      }
    }
    
    // Check if NIC is being changed and if it's already taken
    if (updates.NIC && updates.NIC !== employee.NIC) {
      const existingNIC = await Employee.findOne({ NIC: updates.NIC });
      if (existingNIC) {
        return res.status(400).json({
          success: false,
          message: 'NIC is already in use by another employee'
        });
      }
    }
    
    // Verify department exists if being updated
    if (updates.department) {
      const department = await Department.findById(updates.department);
      if (!department) {
        return res.status(400).json({
          success: false,
          message: 'Department not found'
        });
      }
    }
    
    // Verify job title exists if being updated
    if (updates.jobTitle) {
      const jobTitle = await JobTitle.findById(updates.jobTitle);
      if (!jobTitle) {
        return res.status(400).json({
          success: false,
          message: 'Job title not found'
        });
      }
    }
    
    // Store old values for notification
    const oldValues = { ...employee.toObject() };
    
    // Update employee
    Object.assign(employee, updates);
    employee.updatedBy = req.userId;
    
    await employee.save();
    
    // Populate references for response
    await employee.populate('department', 'name');
    await employee.populate('jobTitle', 'title');
    await employee.populate('createdBy', 'name');
    await employee.populate('updatedBy', 'name');
    
    // Store employee and changes for notification middleware
    req.employee = employee;
    req.body.changes = {};
    
    // Calculate changes for notification
    Object.keys(updates).forEach(key => {
      if (oldValues[key] !== updates[key]) {
        req.body.changes[key] = {
          old: oldValues[key],
          new: updates[key]
        };
      }
    });
    
    res.json({
      success: true,
      message: 'Employee updated successfully',
      data: { employee }
    });
    
  } catch (error) {
    console.error('Update employee error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   DELETE /api/employees/:id
 * @desc    Soft delete employee (mark as resigned)
 * @access  Private (Admin, HR)
 */
router.delete('/:id', authenticate, authorize(['Admin', 'HR'], ['employees:delete']), async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find employee
    const employee = await Employee.findById(id);
    
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }
    
    // Soft delete by marking as resigned
    await employee.softDelete(req.userId);
    
    // Populate references for response
    await employee.populate('department', 'name');
    await employee.populate('jobTitle', 'title');
    
    // Store employee for notification middleware
    req.employee = employee;
    
    res.json({
      success: true,
      message: 'Employee marked as resigned successfully'
    });
    
  } catch (error) {
    console.error('Delete employee error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/employees/statistics
 * @desc    Get employee statistics
 * @access  Private (HR, Admin, Viewer)
 */
router.get('/statistics', authenticate, authorize(['Admin', 'HR', 'Viewer']), async (req, res) => {
  try {
    const statistics = await Employee.getStatistics();
    
    res.json({
      success: true,
      data: { statistics }
    });
    
  } catch (error) {
    console.error('Get employee statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/employees/department-statistics
 * @desc    Get department-wise employee statistics
 * @access  Private (HR, Admin, Viewer)
 */
router.get('/department-statistics', authenticate, authorize(['Admin', 'HR', 'Viewer']), async (req, res) => {
  try {
    const departmentStats = await Employee.getDepartmentStatistics();
    
    res.json({
      success: true,
      data: { departmentStats }
    });
    
  } catch (error) {
    console.error('Get department statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/employees/search
 * @desc    Search employees
 * @access  Private (HR, Admin, Viewer)
 */
router.get('/search', authenticate, authorize(['Admin', 'HR', 'Viewer']), async (req, res) => {
  try {
    const { q: searchTerm, department, jobTitle, status } = req.query;
    
    if (!searchTerm) {
      return res.status(400).json({
        success: false,
        message: 'Search term is required'
      });
    }
    
    // Build filters
    const filters = {};
    if (department) filters.department = department;
    if (jobTitle) filters.jobTitle = jobTitle;
    if (status) filters.status = status;
    
    const employees = await Employee.search(searchTerm, filters);
    
    res.json({
      success: true,
      data: { employees }
    });
    
  } catch (error) {
    console.error('Search employees error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
