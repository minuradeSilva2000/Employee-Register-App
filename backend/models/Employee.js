const mongoose = require('mongoose');

/**
 * Employee Schema - Core Employee Management
 * Handles employee information with soft delete functionality
 */
const employeeSchema = new mongoose.Schema({
  // Auto-generated unique employee ID
  employeeId: {
    type: String,
    required: true,
    trim: true,
    match: [/^EMP\d{6}$/, 'Employee ID must be in format EMP000000']
  },
  
  // Personal Information
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    maxlength: [100, 'Full name cannot exceed 100 characters']
  },
  
  NIC: {
    type: String,
    required: [true, 'NIC is required'],
    trim: true,
    match: [/^\d{9}[Vv]$/, 'NIC must be in format 123456789V']
  },
  
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email address'
    ]
  },
  
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    match: [/^\+?[\d\s-()]+$/, 'Please enter a valid phone number']
  },
  
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true,
    maxlength: [200, 'Address cannot exceed 200 characters']
  },
  
  // Job Information
  jobTitle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobTitle',
    required: [true, 'Job title is required']
  },
  
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: [true, 'Department is required']
  },
  
  salary: {
    type: Number,
    required: [true, 'Salary is required'],
    min: [0, 'Salary cannot be negative'],
    max: [1000000, 'Salary cannot exceed 1,000,000']
  },
  
  // Employment Information
  dateJoined: {
    type: Date,
    required: [true, 'Date joined is required'],
    validate: {
      validator: function(value) {
        return value <= new Date();
      },
      message: 'Date joined cannot be in the future'
    }
  },
  
  status: {
    type: String,
    required: true,
    enum: {
      values: ['Active', 'Resigned'],
      message: 'Status must be either Active or Resigned'
    },
    default: 'Active'
  },
  
  dateResigned: {
    type: Date,
    validate: {
      validator: function(value) {
        // Only validate if status is Resigned
        if (this.status === 'Resigned') {
          return value && value >= this.dateJoined;
        }
        return true;
      },
      message: 'Date resigned must be provided and must be after date joined'
    }
  },
  
  // Soft delete field
  isDeleted: {
    type: Boolean,
    default: false,
    select: false // Don't include in queries by default
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
  timestamps: true, // Automatically add createdAt and updatedAt
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
 * Indexes for performance
 */
employeeSchema.index({ employeeId: 1 }, { unique: true });
employeeSchema.index({ email: 1 }, { unique: true });
employeeSchema.index({ NIC: 1 }, { unique: true });
employeeSchema.index({ department: 1 });
employeeSchema.index({ jobTitle: 1 });
employeeSchema.index({ status: 1 });
employeeSchema.index({ fullName: 'text', email: 'text' }); // For search functionality
employeeSchema.index({ isDeleted: 1 });

/**
 * Pre-save middleware to auto-generate employee ID
 */
employeeSchema.pre('save', async function(next) {
  // Only generate employeeId if it's a new document and employeeId is not provided
  if (this.isNew && !this.employeeId) {
    try {
      const lastEmployee = await this.constructor.findOne(
        { isDeleted: { $ne: true } },
        { employeeId: 1 },
        { sort: { employeeId: -1 } }
      );
      
      let nextNumber = 1;
      if (lastEmployee && lastEmployee.employeeId) {
        const lastNumber = parseInt(lastEmployee.employeeId.replace('EMP', ''));
        nextNumber = lastNumber + 1;
      }
      
      this.employeeId = `EMP${nextNumber.toString().padStart(6, '0')}`;
    } catch (error) {
      return next(error);
    }
  }
  
  // Auto-set dateResigned when status changes to Resigned
  if (this.isModified('status') && this.status === 'Resigned' && !this.dateResigned) {
    this.dateResigned = new Date();
  }
  
  // Clear dateResigned when status changes back to Active
  if (this.isModified('status') && this.status === 'Active') {
    this.dateResigned = undefined;
  }
  
  next();
});

/**
 * Pre-find middleware to automatically exclude soft-deleted records
 */
employeeSchema.pre(/^find/, function(next) {
  // Don't apply soft delete filter if explicitly querying for deleted records
  if (!this.getQuery().includeDeleted) {
    this.find({ isDeleted: { $ne: true } });
  }
  next();
});

/**
 * Instance method to soft delete employee
 * @param {string} deletedBy - User ID of who deleted the employee
 */
employeeSchema.methods.softDelete = function(deletedBy) {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.status = 'Resigned';
  this.dateResigned = new Date();
  this.updatedBy = deletedBy;
  return this.save();
};

/**
 * Instance method to restore soft-deleted employee
 */
employeeSchema.methods.restore = function() {
  this.isDeleted = false;
  this.deletedAt = undefined;
  this.updatedBy = undefined;
  return this.save();
};

/**
 * Static method to get employee statistics
 * @returns {Promise<Object>} - Employee statistics
 */
employeeSchema.statics.getStatistics = async function() {
  const stats = await this.aggregate([
    {
      $match: { isDeleted: { $ne: true } }
    },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        active: {
          $sum: { $cond: [{ $eq: ['$status', 'Active'] }, 1, 0] }
        },
        resigned: {
          $sum: { $cond: [{ $eq: ['$status', 'Resigned'] }, 1, 0] }
        },
        totalSalary: { $sum: '$salary' },
        avgSalary: { $avg: '$salary' }
      }
    }
  ]);
  
  return stats[0] || {
    total: 0,
    active: 0,
    resigned: 0,
    totalSalary: 0,
    avgSalary: 0
  };
};

/**
 * Static method to get department-wise employee count
 * @returns {Promise<Array>} - Department-wise employee statistics
 */
employeeSchema.statics.getDepartmentStatistics = async function() {
  return await this.aggregate([
    {
      $match: { isDeleted: { $ne: true } }
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
        count: { $sum: 1 },
        totalSalary: { $sum: '$salary' },
        avgSalary: { $avg: '$salary' }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);
};

/**
 * Static method to search employees
 * @param {string} searchTerm - Search term
 * @param {Object} filters - Additional filters
 * @returns {Promise<Array>} - Search results
 */
employeeSchema.statics.search = function(searchTerm, filters = {}) {
  const query = {
    isDeleted: { $ne: true },
    ...filters
  };
  
  if (searchTerm) {
    query.$or = [
      { fullName: { $regex: searchTerm, $options: 'i' } },
      { email: { $regex: searchTerm, $options: 'i' } },
      { employeeId: { $regex: searchTerm, $options: 'i' } }
    ];
  }
  
  return this.find(query)
    .populate('department', 'name')
    .populate('jobTitle', 'title')
    .sort({ createdAt: -1 });
};

const Employee = mongoose.model('Employee', employeeSchema);

module.exports = Employee;
