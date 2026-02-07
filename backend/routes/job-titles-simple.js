const express = require('express');
const JobTitle = require('../models/JobTitle');

const router = express.Router();

/**
 * @route   GET /api/job-titles
 * @desc    Get all job titles
 * @access  Private
 */
router.get('/', async (req, res) => {
  try {
    const jobTitles = await JobTitle.find({ isDeleted: { $ne: true } })
      .sort({ title: 1 });
    
    res.json({
      success: true,
      data: { jobTitles }
    });
  } catch (error) {
    console.error('Get job titles error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
