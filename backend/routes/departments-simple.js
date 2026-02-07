const express = require('express');
const Department = require('../models/Department');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   GET /api/departments
 * @desc    Get all departments
 * @access  Private (Admin, HR, Viewer)
 */
router.get('/', authenticate, authorize(['Admin', 'HR', 'Viewer']), async (req, res) => {
  try {
    const departments = await Department.find({ isDeleted: { $ne: true } })
      .sort({ name: 1 });
    
    res.json({
      success: true,
      data: { departments }
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
 * @route   POST /api/departments
 * @desc    Create new department
 * @access  Private (Admin)
 */
router.post('/', authenticate, authorize(['Admin']), async (req, res) => {
  try {
    const { name, description } = req.body;
    
    if (!name || !description) {
      return res.status(400).json({
        success: false,
        message: 'Name and description are required'
      });
    }
    
    // Check if department already exists
    const existingDept = await Department.findOne({ name });
    if (existingDept) {
      return res.status(400).json({
        success: false,
        message: 'Department with this name already exists'
      });
    }
    
    const department = new Department({
      name,
      description,
      createdBy: req.userId
    });
    
    await department.save();
    
    res.status(201).json({
      success: true,
      message: 'Department created successfully',
      data: { department }
    });
  } catch (error) {
    console.error('Create department error:', error);
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
    const department = await Department.findById(req.params.id);
    
    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }
    
    res.json({
      success: true,
      data: { department }
    });
  } catch (error) {
    console.error('Get department error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
