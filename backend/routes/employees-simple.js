const express = require('express');
const Employee = require('../models/Employee');
const Department = require('../models/Department');
const JobTitle = require('../models/JobTitle');

const router = express.Router();

/**
 * @route   GET /api/employees
 * @desc    Get all employees
 * @access  Private
 */
router.get('/', async (req, res) => {
  try {
    const employees = await Employee.find({ isDeleted: { $ne: true } })
      .populate('department', 'name')
      .populate('jobTitle', 'title')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: { employees }
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
 * @access  Private
 */
router.get('/:id', async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id)
      .populate('department', 'name')
      .populate('jobTitle', 'title');
    
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

module.exports = router;
