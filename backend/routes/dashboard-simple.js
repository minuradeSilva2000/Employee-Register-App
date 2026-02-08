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

    // Get monthly trend for the last 6 months
    const monthlyTrend = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const newHires = await Employee.countDocuments({
        createdAt: { $gte: monthStart, $lte: monthEnd },
        isDeleted: { $ne: true }
      });

      const Attendance = require('../models/Attendance');
      const attendanceRecords = await Attendance.countDocuments({
        date: { $gte: monthStart, $lte: monthEnd }
      });

      monthlyTrend.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short' }),
        newHires,
        attendanceRecords
      });
    }

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
        attendanceRate: 85 // Default value
      },
      recentEmployees,
      departmentDistribution,
      monthlyTrend
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

/**
 * @route   GET /api/dashboard/payment-overview
 * @desc    Get payment overview statistics
 * @access  Private
 */
router.get('/payment-overview', async (req, res) => {
  try {
    // Get salary statistics
    const employees = await Employee.find({ 
      status: 'Active', 
      isDeleted: { $ne: true } 
    }).populate('department', 'name');

    const monthlySalaryCost = employees.reduce((sum, emp) => sum + (emp.salary || 0), 0);
    const avgSalary = employees.length > 0 ? monthlySalaryCost / employees.length : 0;

    // Department salary breakdown
    const departmentSalaryBreakdown = await Employee.aggregate([
      { $match: { status: 'Active', isDeleted: { $ne: true } } },
      {
        $group: {
          _id: '$department',
          totalSalary: { $sum: '$salary' },
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
          departmentName: '$deptInfo.name',
          totalSalary: 1,
          employeeCount: 1,
          avgSalary: { $divide: ['$totalSalary', '$employeeCount'] }
        }
      },
      { $sort: { totalSalary: -1 } }
    ]);

    // Salary distribution
    const salaryRanges = [
      { range: '0-30k', min: 0, max: 30000 },
      { range: '30k-50k', min: 30000, max: 50000 },
      { range: '50k-70k', min: 50000, max: 70000 },
      { range: '70k-100k', min: 70000, max: 100000 },
      { range: '100k+', min: 100000, max: Infinity }
    ];

    const salaryDistribution = await Promise.all(
      salaryRanges.map(async (range) => {
        const count = await Employee.countDocuments({
          status: 'Active',
          isDeleted: { $ne: true },
          salary: { $gte: range.min, $lt: range.max }
        });
        return { range: range.range, count };
      })
    );

    const paymentOverview = {
      monthlySalaryCost,
      avgSalary,
      totalEmployees: employees.length,
      departmentSalaryBreakdown,
      salaryDistribution
    };

    res.json({
      success: true,
      data: { paymentOverview }
    });

  } catch (error) {
    console.error('Get payment overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/dashboard/attendance-analytics
 * @desc    Get attendance analytics
 * @access  Private
 */
router.get('/attendance-analytics', async (req, res) => {
  try {
    const Attendance = require('../models/Attendance');
    
    // Get attendance statistics for the current month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const endOfMonth = new Date();
    endOfMonth.setMonth(endOfMonth.getMonth() + 1);
    endOfMonth.setDate(0);
    endOfMonth.setHours(23, 59, 59, 999);

    const attendanceRecords = await Attendance.find({
      date: { $gte: startOfMonth, $lte: endOfMonth }
    });

    const totalRecords = attendanceRecords.length;
    const present = attendanceRecords.filter(r => r.status === 'Present').length;
    const absent = attendanceRecords.filter(r => r.status === 'Absent').length;
    const halfDay = attendanceRecords.filter(r => r.status === 'Half Day').length;
    const leave = attendanceRecords.filter(r => r.status === 'Leave').length;

    const attendanceRate = totalRecords > 0 
      ? ((present + halfDay * 0.5) / totalRecords * 100).toFixed(2)
      : 0;

    // Daily attendance trend for the last 7 days
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);

      const dayRecords = await Attendance.countDocuments({
        date: { $gte: date, $lt: nextDay },
        status: 'Present'
      });

      last7Days.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        present: dayRecords
      });
    }

    const attendanceAnalytics = {
      totalRecords,
      present,
      absent,
      halfDay,
      leave,
      attendanceRate: parseFloat(attendanceRate),
      dailyTrend: last7Days
    };

    res.json({
      success: true,
      data: { attendanceAnalytics }
    });

  } catch (error) {
    console.error('Get attendance analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
