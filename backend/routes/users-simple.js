const express = require('express');
const router = express.Router();

/**
 * @route   GET /api/users
 * @desc    Get all users
 * @access  Private (Admin only)
 */
router.get('/', async (req, res) => {
  try {
    const User = require('../models/User');
    const users = await User.find({ isActive: true })
      .select('-password -refreshToken')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: { users }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
