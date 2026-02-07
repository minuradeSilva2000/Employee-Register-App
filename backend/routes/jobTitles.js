const express = require('express');
const { body, validationResult } = require('express-validator');
const JobTitle = require('../models/JobTitle');
const { authenticate, authorize } = require('../middleware/auth');
const { autoNotification } = require('../middleware/notifications');

const router = express.Router();

// Apply auto-notification middleware
router.use(autoNotification);

/**
 * @route   GET /api/job-titles
 * @desc    Get all job titles with employee counts
 * @access  Private (Admin, HR, Viewer)
 */
router.get('/', authenticate, authorize(['Admin', 'HR', 'Viewer']), async (req, res) => {
  try {
    const { page = 1, limit = 10, search, includeEmployeeCount = true } = req.query;
    
    // Build query
    const query = {};
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    let jobTitles;
    let total;
    
    if (includeEmployeeCount === 'true') {
      // Get job titles with employee counts
      const result = await JobTitle.getAllWithEmployeeCount();
      
      // Apply search filter if needed
      let filteredResult = result;
      if (search) {
        filteredResult = result.filter(job => 
          job.title.toLowerCase().includes(search.toLowerCase()) ||
          job.description.toLowerCase().includes(search.toLowerCase())
        );
      }
      
      // Apply pagination
      total = filteredResult.length;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + parseInt(limit);
      jobTitles = filteredResult.slice(startIndex, endIndex);
    } else {
      // Get job titles without employee counts
      jobTitles = await JobTitle.find(query)
        .populate('createdBy', 'name')
        .populate('updatedBy', 'name')
        .sort({ title: 1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);
      
      total = await JobTitle.countDocuments(query);
    }
    
    res.json({
      success: true,
      data: {
        jobTitles,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
    
  } catch (error) {
    console.error('Get job titles error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/job-titles/:id
 * @desc    Get job title by ID
 * @access  Private (Admin, HR, Viewer)
 */
router.get('/:id', authenticate, authorize(['Admin', 'HR', 'Viewer']), async (req, res) => {
  try {
    const { id } = req.params;
    
    const jobTitle = await JobTitle.findById(id)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');
    
    if (!jobTitle) {
      return res.status(404).json({
        success: false,
        message: 'Job title not found'
      });
    }
    
    // Get employee count
    const employeeCount = await jobTitle.getEmployeeCount();
    
    const jobTitleWithCount = {
      ...jobTitle.toObject(),
      employeeCount
    };
    
    res.json({
      success: true,
      data: { jobTitle: jobTitleWithCount }
    });
    
  } catch (error) {
    console.error('Get job title error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   POST /api/job-titles
 * @desc    Create new job title
 * @access  Private (Admin)
 */
router.post('/', [
  authenticate,
  authorize(['Admin'], ['jobTitles:create']),
  [
    body('title')
      .trim()
      .notEmpty()
      .withMessage('Job title is required')
      .isLength({ max: 100 })
      .withMessage('Job title cannot exceed 100 characters')
      .custom(async (value) => {
        const existingJobTitle = await JobTitle.findOne({ title: value });
        if (existingJobTitle) {
          throw new Error('Job title with this name already exists');
        }
        return true;
      }),
    body('description')
      .trim()
      .notEmpty()
      .withMessage('Description is required')
      .isLength({ max: 500 })
      .withMessage('Description cannot exceed 500 characters')
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
    
    const { title, description } = req.body;
    
    // Create new job title
    const jobTitle = new JobTitle({
      title,
      description,
      createdBy: req.userId
    });
    
    await jobTitle.save();
    
    // Populate references for response
    await jobTitle.populate('createdBy', 'name');
    
    // Store job title for notification middleware
    req.jobTitle = jobTitle;
    
    res.status(201).json({
      success: true,
      message: 'Job title created successfully',
      data: { jobTitle }
    });
    
  } catch (error) {
    console.error('Create job title error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Job title with this name already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   PUT /api/job-titles/:id
 * @desc    Update job title
 * @access  Private (Admin)
 */
router.put('/:id', [
  authenticate,
  authorize(['Admin'], ['jobTitles:update']),
  [
    body('title')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Job title cannot be empty')
      .isLength({ max: 100 })
      .withMessage('Job title cannot exceed 100 characters')
      .custom(async (value, { req }) => {
        const existingJobTitle = await JobTitle.findOne({ 
          title: value,
          _id: { $ne: req.params.id }
        });
        if (existingJobTitle) {
          throw new Error('Job title with this name already exists');
        }
        return true;
      }),
    body('description')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Description cannot be empty')
      .isLength({ max: 500 })
      .withMessage('Description cannot exceed 500 characters')
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
    
    // Find job title
    const jobTitle = await JobTitle.findById(id);
    
    if (!jobTitle) {
      return res.status(404).json({
        success: false,
        message: 'Job title not found'
      });
    }
    
    // Update job title
    Object.assign(jobTitle, updates);
    jobTitle.updatedBy = req.userId;
    
    await jobTitle.save();
    
    // Populate references for response
    await jobTitle.populate('createdBy', 'name');
    await jobTitle.populate('updatedBy', 'name');
    
    // Store job title for notification middleware
    req.jobTitle = jobTitle;
    
    res.json({
      success: true,
      message: 'Job title updated successfully',
      data: { jobTitle }
    });
    
  } catch (error) {
    console.error('Update job title error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Job title with this name already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   DELETE /api/job-titles/:id
 * @desc    Delete job title (with validation)
 * @access  Private (Admin)
 */
router.delete('/:id', authenticate, authorize(['Admin'], ['jobTitles:delete']), async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find job title
    const jobTitle = await JobTitle.findById(id);
    
    if (!jobTitle) {
      return res.status(404).json({
        success: false,
        message: 'Job title not found'
      });
    }
    
    // Check if job title has employees
    const employeeCount = await jobTitle.getEmployeeCount();
    
    if (employeeCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete job title "${jobTitle.title}" because ${employeeCount} employee(s) have this job title. Please reassign the employees first.`
      });
    }
    
    // Store job title info for notification before deletion
    const jobTitleInfo = jobTitle.toObject();
    
    // Delete job title
    await jobTitle.remove();
    
    // Store job title for notification middleware
    req.jobTitle = jobTitleInfo;
    
    res.json({
      success: true,
      message: 'Job title deleted successfully'
    });
    
  } catch (error) {
    console.error('Delete job title error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/job-titles/statistics
 * @desc    Get job title statistics
 * @access  Private (Admin, HR, Viewer)
 */
router.get('/statistics', authenticate, authorize(['Admin', 'HR', 'Viewer']), async (req, res) => {
  try {
    const statistics = await JobTitle.getStatistics();
    
    res.json({
      success: true,
      data: { statistics }
    });
    
  } catch (error) {
    console.error('Get job title statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/job-titles/with-employee-count
 * @desc    Get all job titles with employee counts (no pagination)
 * @access  Private (Admin, HR, Viewer)
 */
router.get('/with-employee-count', authenticate, authorize(['Admin', 'HR', 'Viewer']), async (req, res) => {
  try {
    const jobTitles = await JobTitle.getAllWithEmployeeCount();
    
    res.json({
      success: true,
      data: { jobTitles }
    });
    
  } catch (error) {
    console.error('Get job titles with employee count error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/job-titles/most-popular
 * @desc    Get most popular job titles
 * @access  Private (Admin, HR, Viewer)
 */
router.get('/most-popular', authenticate, authorize(['Admin', 'HR', 'Viewer']), async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const popularJobTitles = await JobTitle.getMostPopular(parseInt(limit));
    
    res.json({
      success: true,
      data: { popularJobTitles }
    });
    
  } catch (error) {
    console.error('Get most popular job titles error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/job-titles/search
 * @desc    Search job titles
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
    
    const jobTitles = await JobTitle.search(searchTerm);
    
    res.json({
      success: true,
      data: { jobTitles }
    });
    
  } catch (error) {
    console.error('Search job titles error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
