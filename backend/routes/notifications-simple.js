const express = require('express');
const router = express.Router();

/**
 * @route   GET /api/notifications
 * @desc    Get notifications
 * @access  Private
 */
router.get('/', async (req, res) => {
  try {
    // Return empty array for now
    res.json({
      success: true,
      data: { 
        notifications: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          pages: 0
        }
      }
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
