const express = require('express');
const Employee = require('../models/Employee');
const Department = require('../models/Department');
const JobTitle = require('../models/JobTitle');
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   GET /api/dashboard/overview
 * @desc    Get dashboard overview statistics
 * @access  Private (Admin, HR, Viewer)
 */
router.get('/overview', authenticate, authorize(['Admin', 'HR', 'Viewer']), async (req, res) => {
  try {
    // Get all statistics in parallel for better performance
    const [
      employeeStats,
      departmentStats,
      jobTitleStats,
      userStats,
      attendanceStats
    ] = await Promise.all([
      Employee.getStatistics(),
      Department.getStatistics(),
      JobTitle.getStatistics(),
      User.getStatistics(),
      // Get attendance stats for last 30 days
      Attendance.getStatistics(
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        new Date()
      )
    ]);
    
    // Calculate additional metrics
    const totalSalaryCost = employeeStats.totalSalary || 0;
    const avgSalary = employeeStats.avgSalary || 0;
    
    // Get recent activities (last 5 employees)
    const recentEmployees = await Employee.find()
      .populate('department', 'name')
      .populate('jobTitle', 'title')
      .sort({ createdAt: -1 })
      .limit(5);
    
    // Get department-wise employee distribution
    const departmentDistribution = await Employee.getDepartmentStatistics();
    
    // Get monthly attendance trend (last 6 months)
    const monthlyTrend = await getMonthlyTrend();
    
    const overview = {
      employees: {
        total: employeeStats.total || 0,
        active: employeeStats.active || 0,
        resigned: employeeStats.resigned || 0,
        totalSalaryCost,
        avgSalary: Math.round(avgSalary)
      },
      departments: {
        total: departmentStats.totalDepartments || 0,
        totalEmployees: departmentStats.totalEmployees || 0
      },
      jobTitles: {
        total: jobTitleStats.totalJobTitles || 0,
        totalEmployees: jobTitleStats.totalEmployees || 0
      },
      users: userStats,
      attendance: {
        totalRecords: attendanceStats.totalRecords || 0,
        present: attendanceStats.present || 0,
        absent: attendanceStats.absent || 0,
        halfDay: attendanceStats.halfDay || 0,
        leave: attendanceStats.leave || 0,
        attendanceRate: attendanceStats.totalRecords > 0 
          ? Math.round((attendanceStats.present / attendanceStats.totalRecords) * 100)
          : 0
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
 * @desc    Get payment and salary overview
 * @access  Private (Admin, HR, Viewer)
 */
router.get('/payment-overview', authenticate, authorize(['Admin', 'HR', 'Viewer']), async (req, res) => {
  try {
    // Get department-wise salary breakdown
    const departmentSalaryBreakdown = await getDepartmentSalaryBreakdown();
    
    // Get job title-wise salary breakdown
    const jobTitleSalaryBreakdown = await getJobTitleSalaryBreakdown();
    
    // Get salary distribution ranges
    const salaryDistribution = await getSalaryDistribution();
    
    // Get highest and lowest paid employees
    const salaryExtremes = await getSalaryExtremes();
    
    // Calculate monthly salary cost
    const monthlySalaryCost = await calculateMonthlySalaryCost();
    
    const paymentOverview = {
      monthlySalaryCost,
      departmentSalaryBreakdown,
      jobTitleSalaryBreakdown,
      salaryDistribution,
      salaryExtremes
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
 * @desc    Get detailed attendance analytics
 * @access  Private (Admin, HR, Viewer)
 */
router.get('/attendance-analytics', authenticate, authorize(['Admin', 'HR', 'Viewer']), async (req, res) => {
  try {
    const { period = '30' } = req.query; // Default to last 30 days
    
    const days = parseInt(period);
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    // Get attendance statistics for the period
    const attendanceStats = await Attendance.getStatistics(startDate, endDate);
    
    // Get daily attendance trend
    const dailyTrend = await getDailyAttendanceTrend(startDate, endDate);
    
    // Get department-wise attendance
    const departmentAttendance = await getDepartmentAttendance(startDate, endDate);
    
    // Get top performers (best attendance)
    const topPerformers = await getTopPerformers(startDate, endDate);
    
    // Get attendance by day of week
    const dayOfWeekAnalysis = await getDayOfWeekAnalysis(startDate, endDate);
    
    const attendanceAnalytics = {
      period: {
        startDate,
        endDate,
        days
      },
      statistics: attendanceStats,
      dailyTrend,
      departmentAttendance,
      topPerformers,
      dayOfWeekAnalysis
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

/**
 * @route   GET /api/dashboard/employee-trends
 * @desc    Get employee trends and analytics
 * @access  Private (Admin, HR, Viewer)
 */
router.get('/employee-trends', authenticate, authorize(['Admin', 'HR', 'Viewer']), async (req, res) => {
  try {
    // Get employee growth over time (last 12 months)
    const employeeGrowth = await getEmployeeGrowth();
    
    // Get department growth trends
    const departmentGrowth = await getDepartmentGrowth();
    
    // Get turnover rate
    const turnoverRate = await calculateTurnoverRate();
    
    // Get new hires vs resignations trend
    const hiresVsResignations = await getHiresVsResignations();
    
    const employeeTrends = {
      employeeGrowth,
      departmentGrowth,
      turnoverRate,
      hiresVsResignations
    };
    
    res.json({
      success: true,
      data: { employeeTrends }
    });
    
  } catch (error) {
    console.error('Get employee trends error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * Helper function to get monthly trend data
 */
async function getMonthlyTrend() {
  const months = [];
  const currentDate = new Date();
  
  for (let i = 5; i >= 0; i--) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    const startDate = new Date(date.getFullYear(), date.getMonth(), 1);
    const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    
    const [employeeCount, attendanceCount] = await Promise.all([
      Employee.countDocuments({
        dateJoined: { $gte: startDate, $lte: endDate }
      }),
      Attendance.countDocuments({
        date: { $gte: startDate, $lte: endDate }
      })
    ]);
    
    months.push({
      month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      newHires: employeeCount,
      attendanceRecords: attendanceCount
    });
  }
  
  return months;
}

/**
 * Helper function to get department salary breakdown
 */
async function getDepartmentSalaryBreakdown() {
  return await Employee.aggregate([
    {
      $match: { status: 'Active' }
    },
    {
      $lookup: {
        from: 'departments',
        localField: 'department',
        foreignField: '_id',
        as: 'deptInfo'
      }
    },
    {
      $unwind: '$deptInfo'
    },
    {
      $group: {
        _id: '$department',
        departmentName: { $first: '$deptInfo.name' },
        totalSalary: { $sum: '$salary' },
        avgSalary: { $avg: '$salary' },
        employeeCount: { $sum: 1 }
      }
    },
    {
      $sort: { totalSalary: -1 }
    }
  ]);
}

/**
 * Helper function to get job title salary breakdown
 */
async function getJobTitleSalaryBreakdown() {
  return await Employee.aggregate([
    {
      $match: { status: 'Active' }
    },
    {
      $lookup: {
        from: 'jobtitles',
        localField: 'jobTitle',
        foreignField: '_id',
        as: 'jobInfo'
      }
    },
    {
      $unwind: '$jobInfo'
    },
    {
      $group: {
        _id: '$jobTitle',
        jobTitle: { $first: '$jobInfo.title' },
        totalSalary: { $sum: '$salary' },
        avgSalary: { $avg: '$salary' },
        employeeCount: { $sum: 1 }
      }
    },
    {
      $sort: { totalSalary: -1 }
    },
    {
      $limit: 10
    }
  ]);
}

/**
 * Helper function to get salary distribution
 */
async function getSalaryDistribution() {
  const ranges = [
    { name: '0-30K', min: 0, max: 30000 },
    { name: '30K-50K', min: 30000, max: 50000 },
    { name: '50K-70K', min: 50000, max: 70000 },
    { name: '70K-90K', min: 70000, max: 90000 },
    { name: '90K-120K', min: 90000, max: 120000 },
    { name: '120K+', min: 120000, max: Infinity }
  ];
  
  const distribution = await Promise.all(
    ranges.map(async (range) => {
      const count = await Employee.countDocuments({
        status: 'Active',
        salary: { $gte: range.min, $lt: range.max === Infinity ? 1000000 : range.max }
      });
      
      return {
        range: range.name,
        count
      };
    })
  );
  
  return distribution;
}

/**
 * Helper function to get salary extremes
 */
async function getSalaryExtremes() {
  const [highest, lowest] = await Promise.all([
    Employee.findOne({ status: 'Active' })
      .populate('department', 'name')
      .populate('jobTitle', 'title')
      .sort({ salary: -1 })
      .limit(1),
    Employee.findOne({ status: 'Active' })
      .populate('department', 'name')
      .populate('jobTitle', 'title')
      .sort({ salary: 1 })
      .limit(1)
  ]);
  
  return {
    highest: highest ? {
      name: highest.fullName,
      salary: highest.salary,
      department: highest.department.name,
      jobTitle: highest.jobTitle.title
    } : null,
    lowest: lowest ? {
      name: lowest.fullName,
      salary: lowest.salary,
      department: lowest.department.name,
      jobTitle: lowest.jobTitle.title
    } : null
  };
}

/**
 * Helper function to calculate monthly salary cost
 */
async function calculateMonthlySalaryCost() {
  const result = await Employee.aggregate([
    {
      $match: { status: 'Active' }
    },
    {
      $group: {
        _id: null,
        totalMonthlyCost: { $sum: '$salary' }
      }
    }
  ]);
  
  return result[0] ? result[0].totalMonthlyCost : 0;
}

/**
 * Helper function to get daily attendance trend
 */
async function getDailyAttendanceTrend(startDate, endDate) {
  return await Attendance.aggregate([
    {
      $match: {
        date: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
        present: {
          $sum: { $cond: [{ $eq: ['$status', 'Present'] }, 1, 0] }
        },
        absent: {
          $sum: { $cond: [{ $eq: ['$status', 'Absent'] }, 1, 0] }
        },
        halfDay: {
          $sum: { $cond: [{ $eq: ['$status', 'Half Day'] }, 1, 0] }
        },
        leave: {
          $sum: { $cond: [{ $eq: ['$status', 'Leave'] }, 1, 0] }
        }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);
}

/**
 * Helper function to get department attendance
 */
async function getDepartmentAttendance(startDate, endDate) {
  return await Attendance.aggregate([
    {
      $match: {
        date: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $lookup: {
        from: 'employees',
        localField: 'employeeId',
        foreignField: '_id',
        as: 'employee'
      }
    },
    {
      $unwind: '$employee'
    },
    {
      $lookup: {
        from: 'departments',
        localField: 'employee.department',
        foreignField: '_id',
        as: 'department'
      }
    },
    {
      $unwind: '$department'
    },
    {
      $group: {
        _id: '$department._id',
        departmentName: { $first: '$department.name' },
        totalRecords: { $sum: 1 },
        present: {
          $sum: { $cond: [{ $eq: ['$status', 'Present'] }, 1, 0] }
        },
        attendanceRate: {
          $avg: { $cond: [{ $eq: ['$status', 'Present'] }, 1, 0] }
        }
      }
    },
    {
      $addFields: {
        attendancePercentage: { $multiply: ['$attendanceRate', 100] }
      }
    },
    {
      $sort: { attendancePercentage: -1 }
    }
  ]);
}

/**
 * Helper function to get top performers
 */
async function getTopPerformers(startDate, endDate) {
  return await Attendance.aggregate([
    {
      $match: {
        date: { $gte: startDate, $lte: endDate },
        status: 'Present'
      }
    },
    {
      $lookup: {
        from: 'employees',
        localField: 'employeeId',
        foreignField: '_id',
        as: 'employee'
      }
    },
    {
      $unwind: '$employee'
    },
    {
      $group: {
        _id: '$employeeId',
        employeeName: { $first: '$employee.fullName' },
        employeeId: { $first: '$employee.employeeId' },
        presentDays: { $sum: 1 },
        avgLateMinutes: { $avg: '$lateMinutes' },
        avgOvertimeMinutes: { $avg: '$overtimeMinutes' }
      }
    },
    {
      $sort: { presentDays: -1 }
    },
    {
      $limit: 10
    }
  ]);
}

/**
 * Helper function to get day of week analysis
 */
async function getDayOfWeekAnalysis(startDate, endDate) {
  return await Attendance.aggregate([
    {
      $match: {
        date: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: { $dayOfWeek: '$date' },
        totalRecords: { $sum: 1 },
        present: {
          $sum: { $cond: [{ $eq: ['$status', 'Present'] }, 1, 0] }
        }
      }
    },
    {
      $addFields: {
        dayName: {
          $switch: {
            branches: [
              { case: { $eq: ['$_id', 1] }, then: 'Sunday' },
              { case: { $eq: ['$_id', 2] }, then: 'Monday' },
              { case: { $eq: ['$_id', 3] }, then: 'Tuesday' },
              { case: { $eq: ['$_id', 4] }, then: 'Wednesday' },
              { case: { $eq: ['$_id', 5] }, then: 'Thursday' },
              { case: { $eq: ['$_id', 6] }, then: 'Friday' },
              { case: { $eq: ['$_id', 7] }, then: 'Saturday' }
            ],
            default: 'Unknown'
          }
        },
        attendanceRate: {
          $multiply: [{ $divide: ['$present', '$totalRecords'] }, 100]
        }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);
}

/**
 * Helper function to get employee growth
 */
async function getEmployeeGrowth() {
  const months = [];
  const currentDate = new Date();
  
  for (let i = 11; i >= 0; i--) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    
    const [totalEmployees, activeEmployees] = await Promise.all([
      Employee.countDocuments({
        dateJoined: { $lte: monthEnd }
      }),
      Employee.countDocuments({
        dateJoined: { $lte: monthEnd },
        status: 'Active'
      })
    ]);
    
    months.push({
      month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      total: totalEmployees,
      active: activeEmployees
    });
  }
  
  return months;
}

/**
 * Helper function to get department growth
 */
async function getDepartmentGrowth() {
  return await Department.aggregate([
    {
      $lookup: {
        from: 'employees',
        localField: '_id',
        foreignField: 'department',
        as: 'employees'
      }
    },
    {
      $addFields: {
        employeeCount: {
          $size: {
            $filter: {
              input: '$employees',
              cond: { $eq: ['$$this.status', 'Active'] }
            }
          }
        }
      }
    },
    {
      $project: {
        name: 1,
        employeeCount: 1
      }
    },
    {
      $sort: { employeeCount: -1 }
    }
  ]);
}

/**
 * Helper function to calculate turnover rate
 */
async function calculateTurnoverRate() {
  const last6Months = new Date();
  last6Months.setMonth(last6Months.getMonth() - 6);
  
  const [totalEmployees, resignedEmployees] = await Promise.all([
    Employee.countDocuments({
      dateJoined: { $lte: last6Months }
    }),
    Employee.countDocuments({
      dateResigned: { $gte: last6Months }
    })
  ]);
  
  return {
    period: 'Last 6 months',
    totalEmployees,
    resignedEmployees,
    turnoverRate: totalEmployees > 0 ? Math.round((resignedEmployees / totalEmployees) * 100) : 0
  };
}

/**
 * Helper function to get hires vs resignations
 */
async function getHiresVsResignations() {
  const months = [];
  const currentDate = new Date();
  
  for (let i = 5; i >= 0; i--) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    const startDate = new Date(date.getFullYear(), date.getMonth(), 1);
    const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    
    const [hires, resignations] = await Promise.all([
      Employee.countDocuments({
        dateJoined: { $gte: startDate, $lte: endDate }
      }),
      Employee.countDocuments({
        dateResigned: { $gte: startDate, $lte: endDate }
      })
    ]);
    
    months.push({
      month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      hires,
      resignations
    });
  }
  
  return months;
}

module.exports = router;
