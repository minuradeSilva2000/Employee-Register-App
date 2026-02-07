const express = require('express');
const Employee = require('../models/Employee');
const Department = require('../models/Department');
const JobTitle = require('../models/JobTitle');

const router = express.Router();

/**
 * @route   GET /api/dashboard/overview
 * @desc    Get dashboard overview statistics
 * @access  Private
 */
router.get('/overview', async (req, res) => {
  try {
    // Get basic statistics
    const [
      totalEmployees,
      activeEmployees,
      resignedEmployees,
      totalDepartments,
      totalJobTitles
    ] = await Promise.all([
      Employee.countDocuments({ isDeleted: { $ne: true } }),
      Employee.countDocuments({ status: 'Active', isDeleted: { $ne: true } }),
      Employee.countDocuments({ status: 'Resigned', isDeleted: { $ne: true } }),
      Department.countDocuments({ isDeleted: { $ne: true } }),
      JobTitle.countDocuments({ isDeleted: { $ne: true } })
    ]);

    // Get recent employees
    const recentEmployees = await Employee.find({ isDeleted: { $ne: true } })
      .populate('department', 'name')
      .populate('jobTitle', 'title')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get department distribution
    const departmentDistribution = await Employee.aggregate([
      { $match: { status: 'Active', isDeleted: { $ne: true } } },
      {
        $group: {
          _id: '$department',
          employeeCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'departments',
          localField: '_id',
          foreignField: '_id',
          as: 'deptInfo'
        }
      },
      { $unwind: '$deptInfo' },
      {
        $project: {
          name: '$deptInfo.name',
          employeeCount: 1
        }
      }
    ]);

    const overview = {
      employees: {
        total: totalEmployees,
        active: activeEmployees,
        resigned: resignedEmployees,
        totalSalaryCost: 0, // Simplified
        avgSalary: 0 // Simplified
      },
      departments: {
        total: totalDepartments,
        totalEmployees: totalEmployees
      },
      jobTitles: {
        total: totalJobTitles,
        totalEmployees: totalEmployees
      },
      attendance: {
        totalRecords: 0,
        present: 0,
        absent: 0,
        halfDay: 0,
        leave: 0,
        attendanceRate: 0
      },
      recentEmployees,
      departmentDistribution,
      monthlyTrend: [] // Simplified
    };

    res.json({
      success: true,
      data: { overview }
    });

  } catch (error) {
    console.error('Get dashboard overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
