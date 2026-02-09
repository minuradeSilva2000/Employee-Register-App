const mongoose = require('mongoose');

/**
 * Department Schema - Department Management
 * Handles department information with employee count tracking
 */
const departmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Department name is required'],
    trim: true,
    unique: true,
    maxlength: [50, 'Department name cannot exceed 50 characters']
  },
  
  description: {
    type: String,
    required: [true, 'Department description is required'],
    trim: true,
    maxlength: [200, 'Description cannot exceed 200 characters']
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
 * Indexes for performance
 */
departmentSchema.index({ isDeleted: 1 });

/**
 * Pre-find middleware to automatically exclude soft-deleted records
 */
departmentSchema.pre(/^find/, function(next) {
  if (!this.getQuery().includeDeleted) {
    this.find({ isDeleted: { $ne: true } });
  }
  next();
});

/**
 * Pre-remove middleware to prevent deletion if employees exist
 */
departmentSchema.pre('remove', async function(next) {
  try {
    const Employee = mongoose.model('Employee');
    const employeeCount = await Employee.countDocuments({ 
      department: this._id,
      isDeleted: { $ne: true }
    });
    
    if (employeeCount > 0) {
      const error = new Error(`Cannot delete department "${this.name}" because it has ${employeeCount} employee(s) assigned to it.`);
      error.statusCode = 400;
      return next(error);
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Instance method to soft delete department
 * @param {string} deletedBy - User ID of who deleted the department
 */
departmentSchema.methods.softDelete = function(deletedBy) {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.updatedBy = deletedBy;
  return this.save();
};

/**
 * Instance method to restore soft-deleted department
 */
departmentSchema.methods.restore = function() {
  this.isDeleted = false;
  this.deletedAt = undefined;
  this.updatedBy = undefined;
  return this.save();
};

/**
 * Instance method to get employee count
 * @returns {Promise<number>} - Number of employees in this department
 */
departmentSchema.methods.getEmployeeCount = async function() {
  const Employee = mongoose.model('Employee');
  return await Employee.countDocuments({ 
    department: this._id,
    isDeleted: { $ne: true }
  });
};

/**
 * Virtual field to get employee count (populated in queries)
 */
departmentSchema.virtual('employeeCount', {
  ref: 'Employee',
  localField: '_id',
  foreignField: 'department',
  count: true,
  match: { isDeleted: { $ne: true } }
});

/**
 * Static method to get all departments with employee counts
 * @returns {Promise<Array>} - Departments with employee counts
 */
departmentSchema.statics.getAllWithEmployeeCount = function() {
  return this.aggregate([
    {
      $match: { isDeleted: { $ne: true } }
    },
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
              cond: { $ne: ['$$this.isDeleted', true] }
            }
          }
        }
      }
    },
    {
      $project: {
        employees: 0 // Exclude the employees array from the result
      }
    },
    {
      $sort: { name: 1 }
    }
  ]);
};

/**
 * Static method to get department statistics
 * @returns {Promise<Object>} - Department statistics
 */
departmentSchema.statics.getStatistics = async function() {
  const stats = await this.aggregate([
    {
      $match: { isDeleted: { $ne: true } }
    },
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
        activeEmployeeCount: {
          $size: {
            $filter: {
              input: '$employees',
              cond: { 
                $and: [
                  { $ne: ['$$this.isDeleted', true] },
                  { $eq: ['$$this.status', 'Active'] }
                ]
              }
            }
          }
        },
        totalEmployeeCount: {
          $size: {
            $filter: {
              input: '$employees',
              cond: { $ne: ['$$this.isDeleted', true] }
            }
          }
        }
      }
    },
    {
      $group: {
        _id: null,
        totalDepartments: { $sum: 1 },
        totalEmployees: { $sum: '$totalEmployeeCount' },
        activeEmployees: { $sum: '$activeEmployeeCount' }
      }
    }
  ]);
  
  return stats[0] || {
    totalDepartments: 0,
    totalEmployees: 0,
    activeEmployees: 0
  };
};

/**
 * Static method to search departments
 * @param {string} searchTerm - Search term
 * @returns {Promise<Array>} - Search results
 */
departmentSchema.statics.search = function(searchTerm) {
  const query = {
    isDeleted: { $ne: true }
  };
  
  if (searchTerm) {
    query.$or = [
      { name: { $regex: searchTerm, $options: 'i' } },
      { description: { $regex: searchTerm, $options: 'i' } }
    ];
  }
  
  return this.find(query).sort({ name: 1 });
};

const Department = mongoose.model('Department', departmentSchema);

module.exports = Department;
