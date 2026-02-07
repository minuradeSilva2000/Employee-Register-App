const mongoose = require('mongoose');

/**
 * Attendance Schema - Attendance Management
 * Handles employee attendance records with check-in/check-out functionality
 */
const attendanceSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: [true, 'Employee ID is required']
  },
  
  date: {
    type: Date,
    required: [true, 'Date is required'],
    validate: {
      validator: function(value) {
        return value <= new Date();
      },
      message: 'Attendance date cannot be in the future'
    }
  },
  
  checkInTime: {
    type: Date,
    validate: {
      validator: function(value) {
        if (!value) return true; // Optional if status is Absent
        return value.toDateString() === this.date.toDateString();
      },
      message: 'Check-in time must be on the same day as attendance date'
    }
  },
  
  checkOutTime: {
    type: Date,
    validate: {
      validator: function(value) {
        if (!value) return true; // Optional if status is Absent
        if (!this.checkInTime) return false;
        return value > this.checkInTime && value.toDateString() === this.date.toDateString();
      },
      message: 'Check-out time must be after check-in time and on the same day'
    }
  },
  
  status: {
    type: String,
    required: [true, 'Attendance status is required'],
    enum: {
      values: ['Present', 'Absent', 'Half Day', 'Leave'],
      message: 'Status must be Present, Absent, Half Day, or Leave'
    },
    default: 'Present'
  },
  
  // Additional fields for detailed tracking
  lateMinutes: {
    type: Number,
    min: 0,
    default: 0
  },
  
  overtimeMinutes: {
    type: Number,
    min: 0,
    default: 0
  },
  
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  
  // Soft delete field
  isDeleted: {
    type: Boolean,
    default: false,
    select: false
  },
  
  deletedAt: {
    type: Date,
    select: false
  },
  
  // Audit fields
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.__v;
      delete ret.isDeleted;
      delete ret.deletedAt;
      return ret;
    }
  }
});

/**
 * Compound unique index for employee and date
 */
attendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });
attendanceSchema.index({ date: 1 });
attendanceSchema.index({ status: 1 });
attendanceSchema.index({ employeeId: 1 });
attendanceSchema.index({ isDeleted: 1 });

/**
 * Pre-find middleware to automatically exclude soft-deleted records
 */
attendanceSchema.pre(/^find/, function(next) {
  if (!this.getQuery().includeDeleted) {
    this.find({ isDeleted: { $ne: true } });
  }
  next();
});

/**
 * Pre-save middleware to calculate late and overtime minutes
 */
attendanceSchema.pre('save', function(next) {
  if (this.checkInTime && this.checkOutTime && this.status === 'Present') {
    // Define working hours (9:00 AM to 5:00 PM)
    const workStartHour = 9;
    const workEndHour = 17;
    
    const checkInHour = this.checkInTime.getHours();
    const checkInMinute = this.checkInTime.getMinutes();
    const checkOutHour = this.checkOutTime.getHours();
    const checkOutMinute = this.checkOutTime.getMinutes();
    
    // Calculate late minutes (if check-in after 9:00 AM)
    if (checkInHour > workStartHour || (checkInHour === workStartHour && checkInMinute > 0)) {
      this.lateMinutes = (checkInHour - workStartHour) * 60 + checkInMinute;
    } else {
      this.lateMinutes = 0;
    }
    
    // Calculate overtime minutes (if check-out after 5:00 PM)
    if (checkOutHour > workEndHour || (checkOutHour === workEndHour && checkOutMinute > 0)) {
      this.overtimeMinutes = (checkOutHour - workEndHour) * 60 + checkOutMinute;
    } else {
      this.overtimeMinutes = 0;
    }
  }
  
  next();
});

/**
 * Instance method to soft delete attendance record
 * @param {string} deletedBy - User ID of who deleted the record
 */
attendanceSchema.methods.softDelete = function(deletedBy) {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.updatedBy = deletedBy;
  return this.save();
};

/**
 * Instance method to restore soft-deleted attendance record
 */
attendanceSchema.methods.restore = function() {
  this.isDeleted = false;
  this.deletedAt = undefined;
  this.updatedBy = undefined;
  return this.save();
};

/**
 * Instance method to calculate work hours
 * @returns {number} - Total work hours in decimal format
 */
attendanceSchema.methods.calculateWorkHours = function() {
  if (!this.checkInTime || !this.checkOutTime || this.status !== 'Present') {
    return 0;
  }
  
  const diffMs = this.checkOutTime - this.checkInTime;
  const diffHours = diffMs / (1000 * 60 * 60);
  
  return Math.round(diffHours * 100) / 100; // Round to 2 decimal places
};

/**
 * Static method to get attendance statistics for a date range
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Promise<Object>} - Attendance statistics
 */
attendanceSchema.statics.getStatistics = async function(startDate, endDate) {
  const matchStage = {
    isDeleted: { $ne: true },
    date: {
      $gte: startDate,
      $lte: endDate
    }
  };
  
  const stats = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalRecords: { $sum: 1 },
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
        },
        totalLateMinutes: { $sum: '$lateMinutes' },
        totalOvertimeMinutes: { $sum: '$overtimeMinutes' }
      }
    }
  ]);
  
  return stats[0] || {
    totalRecords: 0,
    present: 0,
    absent: 0,
    halfDay: 0,
    leave: 0,
    totalLateMinutes: 0,
    totalOvertimeMinutes: 0
  };
};

/**
 * Static method to get attendance by employee
 * @param {string} employeeId - Employee ID
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Promise<Array>} - Attendance records
 */
attendanceSchema.statics.getByEmployee = function(employeeId, startDate, endDate) {
  const query = {
    employeeId,
    isDeleted: { $ne: true }
  };
  
  if (startDate && endDate) {
    query.date = {
      $gte: startDate,
      $lte: endDate
    };
  }
  
  return this.find(query)
    .populate('employeeId', 'fullName employeeId')
    .sort({ date: -1 });
};

/**
 * Static method to get daily attendance summary
 * @param {Date} date - Date to get summary for
 * @returns {Promise<Array>} - Daily attendance summary
 */
attendanceSchema.statics.getDailySummary = function(date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  return this.aggregate([
    {
      $match: {
        date: {
          $gte: startOfDay,
          $lte: endOfDay
        },
        isDeleted: { $ne: true }
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
      $project: {
        employeeName: '$employee.fullName',
        employeeId: '$employee.employeeId',
        departmentName: '$department.name',
        checkInTime: 1,
        checkOutTime: 1,
        status: 1,
        lateMinutes: 1,
        overtimeMinutes: 1
      }
    },
    {
      $sort: { employeeName: 1 }
    }
  ]);
};

/**
 * Static method to get monthly attendance report
 * @param {number} year - Year
 * @param {number} month - Month (1-12)
 * @returns {Promise<Array>} - Monthly attendance report
 */
attendanceSchema.statics.getMonthlyReport = function(year, month) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59, 999);
  
  return this.aggregate([
    {
      $match: {
        date: {
          $gte: startDate,
          $lte: endDate
        },
        isDeleted: { $ne: true }
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
        totalDays: { $sum: 1 },
        presentDays: {
          $sum: { $cond: [{ $eq: ['$status', 'Present'] }, 1, 0] }
        },
        absentDays: {
          $sum: { $cond: [{ $eq: ['$status', 'Absent'] }, 1, 0] }
        },
        halfDayDays: {
          $sum: { $cond: [{ $eq: ['$status', 'Half Day'] }, 1, 0] }
        },
        leaveDays: {
          $sum: { $cond: [{ $eq: ['$status', 'Leave'] }, 1, 0] }
        },
        totalLateMinutes: { $sum: '$lateMinutes' },
        totalOvertimeMinutes: { $sum: '$overtimeMinutes' }
      }
    },
    {
      $addFields: {
        attendancePercentage: {
          $multiply: [
            { $divide: ['$presentDays', '$totalDays'] },
            100
          ]
        }
      }
    },
    {
      $sort: { employeeName: 1 }
    }
  ]);
};

const Attendance = mongoose.model('Attendance', attendanceSchema);

module.exports = Attendance;
