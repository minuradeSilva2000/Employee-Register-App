const express = require('express');
const { body, validationResult } = require('express-validator');
const Department = require('../models/Department');
const { authenticate, authorize } = require('../middleware/auth');
const { autoNotification } = require('../middleware/notifications');

const router = express.Router();

// Apply auto-notification middleware
router.use(autoNotification);

/**
 * @route   GET /api/departments
 * @desc    Get all departments with employee counts
 * @access  Private (Admin, HR, Viewer)
 */
router.get('/', authenticate, authorize(['Admin', 'HR', 'Viewer']), async (req, res) => {
  try {
    const { page = 1, limit = 10, search, includeEmployeeCount = true } = req.query;
    
    // Build query
    const query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    let departments;
    let total;
    
    if (includeEmployeeCount === 'true') {
      // Get departments with employee counts
      const result = await Department.getAllWithEmployeeCount();
      
      // Apply search filter if needed
      let filteredResult = result;
      if (search) {
        filteredResult = result.filter(dept => 
          dept.name.toLowerCase().includes(search.toLowerCase()) ||
          dept.description.toLowerCase().includes(search.toLowerCase())
        );
      }
      
      // Apply pagination
      total = filteredResult.length;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + parseInt(limit);
      departments = filteredResult.slice(startIndex, endIndex);
    } else {
      // Get departments without employee counts
      departments = await Department.find(query)
        .populate('createdBy', 'name')
        .populate('updatedBy', 'name')
        .sort({ name: 1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);
      
      total = await Department.countDocuments(query);
    }
    
    res.json({
      success: true,
      data: {
        departments,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
    
  } catch (error) {
    console.error('Get departments error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/departments/:id
 * @desc    Get department by ID
 * @access  Private (Admin, HR, Viewer)
 */
router.get('/:id', authenticate, authorize(['Admin', 'HR', 'Viewer']), async (req, res) => {
  try {
    const { id } = req.params;
    
    const department = await Department.findById(id)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');
    
    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }
    
    // Get employee count
    const employeeCount = await department.getEmployeeCount();
    
    const departmentWithCount = {
      ...department.toObject(),
      employeeCount
    };
    
    res.json({
      success: true,
      data: { department: departmentWithCount }
    });
    
  } catch (error) {
    console.error('Get department error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   POST /api/departments
 * @desc    Create new department
 * @access  Private (Admin)
 */
router.post('/', [
  authenticate,
  authorize(['Admin'], ['departments:create']),
  [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Department name is required')
      .isLength({ max: 50 })
      .withMessage('Department name cannot exceed 50 characters')
      .custom(async (value) => {
        const existingDept = await Department.findOne({ name: value });
        if (existingDept) {
          throw new Error('Department with this name already exists');
        }
        return true;
      }),
    body('description')
      .trim()
      .notEmpty()
      .withMessage('Description is required')
      .isLength({ max: 200 })
      .withMessage('Description cannot exceed 200 characters')
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
    
    const { name, description } = req.body;
    
    // Create new department
    const department = new Department({
      name,
      description,
      createdBy: req.userId
    });
    
    await department.save();
    
    // Populate references for response
    await department.populate('createdBy', 'name');
    
    // Store department for notification middleware
    req.department = department;
    
    res.status(201).json({
      success: true,
      message: 'Department created successfully',
      data: { department }
    });
    
  } catch (error) {
    console.error('Create department error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Department with this name already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   PUT /api/departments/:id
 * @desc    Update department
 * @access  Private (Admin)
 */
router.put('/:id', [
  authenticate,
  authorize(['Admin'], ['departments:update']),
  [
    body('name')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Department name cannot be empty')
      .isLength({ max: 50 })
      .withMessage('Department name cannot exceed 50 characters')
      .custom(async (value, { req }) => {
        const existingDept = await Department.findOne({ 
          name: value,
          _id: { $ne: req.params.id }
        });
        if (existingDept) {
          throw new Error('Department with this name already exists');
        }
        return true;
      }),
    body('description')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Description cannot be empty')
      .isLength({ max: 200 })
      .withMessage('Description cannot exceed 200 characters')
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
    
    // Find department
    const department = await Department.findById(id);
    
    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }
    
    // Update department
    Object.assign(department, updates);
    department.updatedBy = req.userId;
    
    await department.save();
    
    // Populate references for response
    await department.populate('createdBy', 'name');
    await department.populate('updatedBy', 'name');
    
    // Store department for notification middleware
    req.department = department;
    
    res.json({
      success: true,
      message: 'Department updated successfully',
      data: { department }
    });
    
  } catch (error) {
    console.error('Update department error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Department with this name already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   DELETE /api/departments/:id
 * @desc    Delete department (with validation)
 * @access  Private (Admin)
 */
router.delete('/:id', authenticate, authorize(['Admin'], ['departments:delete']), async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find department
    const department = await Department.findById(id);
    
    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }
    
    // Check if department has employees
    const employeeCount = await department.getEmployeeCount();
    
    if (employeeCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete department "${department.name}" because it has ${employeeCount} employee(s) assigned to it. Please reassign or remove the employees first.`
      });
    }
    
    // Store department info for notification before deletion
    const departmentInfo = department.toObject();
    
    // Delete department
    await department.remove();
    
    // Store department for notification middleware
    req.department = departmentInfo;
    
    res.json({
      success: true,
      message: 'Department deleted successfully'
    });
    
  } catch (error) {
    console.error('Delete department error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/departments/statistics
 * @desc    Get department statistics
 * @access  Private (Admin, HR, Viewer)
 */
router.get('/statistics', authenticate, authorize(['Admin', 'HR', 'Viewer']), async (req, res) => {
  try {
    const statistics = await Department.getStatistics();
    
    res.json({
      success: true,
      data: { statistics }
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
 * @route   GET /api/departments/with-employee-count
 * @desc    Get all departments with employee counts (no pagination)
 * @access  Private (Admin, HR, Viewer)
 */
router.get('/with-employee-count', authenticate, authorize(['Admin', 'HR', 'Viewer']), async (req, res) => {
  try {
    const departments = await Department.getAllWithEmployeeCount();
    
    res.json({
      success: true,
      data: { departments }
    });
    
  } catch (error) {
    console.error('Get departments with employee count error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/departments/search
 * @desc    Search departments
 * @access  Private (Admin, HR, Viewer)
 */
router.get('/search', authenticate, authorize(['Admin', 'HR', 'Viewer']), async (req, res) => {
  try {
    const { q: searchTerm } = req.query;
    
    if (!searchTerm) {
      return res.status(400).json({
        success: false,
        message: 'Search term is required'
      });
    }
    
    const departments = await Department.search(searchTerm);
    
    res.json({
      success: true,
      data: { departments }
    });
    
  } catch (error) {
    console.error('Search departments error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
