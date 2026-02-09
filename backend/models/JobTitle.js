const mongoose = require('mongoose');

/**
 * JobTitle Schema - Job Title/Designation Management
 * Handles job titles and designations with employee tracking
 */
const jobTitleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true,
    unique: true,
    maxlength: [100, 'Job title cannot exceed 100 characters']
  },
  
  description: {
    type: String,
    required: [true, 'Job description is required'],
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
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
jobTitleSchema.index({ isDeleted: 1 });

/**
 * Pre-find middleware to automatically exclude soft-deleted records
 */
jobTitleSchema.pre(/^find/, function(next) {
  if (!this.getQuery().includeDeleted) {
    this.find({ isDeleted: { $ne: true } });
  }
  next();
});

/**
 * Pre-remove middleware to prevent deletion if employees exist
 */
jobTitleSchema.pre('remove', async function(next) {
  try {
    const Employee = mongoose.model('Employee');
    const employeeCount = await Employee.countDocuments({ 
      jobTitle: this._id,
      isDeleted: { $ne: true }
    });
    
    if (employeeCount > 0) {
      const error = new Error(`Cannot delete job title "${this.title}" because ${employeeCount} employee(s) have this job title.`);
      error.statusCode = 400;
      return next(error);
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Instance method to soft delete job title
 * @param {string} deletedBy - User ID of who deleted the job title
 */
jobTitleSchema.methods.softDelete = function(deletedBy) {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.updatedBy = deletedBy;
  return this.save();
};

/**
 * Instance method to restore soft-deleted job title
 */
jobTitleSchema.methods.restore = function() {
  this.isDeleted = false;
  this.deletedAt = undefined;
  this.updatedBy = undefined;
  return this.save();
};

/**
 * Instance method to get employee count
 * @returns {Promise<number>} - Number of employees with this job title
 */
jobTitleSchema.methods.getEmployeeCount = async function() {
  const Employee = mongoose.model('Employee');
  return await Employee.countDocuments({ 
    jobTitle: this._id,
    isDeleted: { $ne: true }
  });
};

/**
 * Virtual field to get employee count (populated in queries)
 */
jobTitleSchema.virtual('employeeCount', {
  ref: 'Employee',
  localField: '_id',
  foreignField: 'jobTitle',
  count: true,
  match: { isDeleted: { $ne: true } }
});

/**
 * Static method to get all job titles with employee counts
 * @returns {Promise<Array>} - Job titles with employee counts
 */
jobTitleSchema.statics.getAllWithEmployeeCount = function() {
  return this.aggregate([
    {
      $match: { isDeleted: { $ne: true } }
    },
    {
      $lookup: {
        from: 'employees',
        localField: '_id',
        foreignField: 'jobTitle',
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
        },
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
        }
      }
    },
    {
      $project: {
        employees: 0 // Exclude the employees array from the result
      }
    },
    {
      $sort: { title: 1 }
    }
  ]);
};

/**
 * Static method to get job title statistics
 * @returns {Promise<Object>} - Job title statistics
 */
jobTitleSchema.statics.getStatistics = async function() {
  const stats = await this.aggregate([
    {
      $match: { isDeleted: { $ne: true } }
    },
    {
      $lookup: {
        from: 'employees',
        localField: '_id',
        foreignField: 'jobTitle',
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
        totalJobTitles: { $sum: 1 },
        totalEmployees: { $sum: '$totalEmployeeCount' },
        activeEmployees: { $sum: '$activeEmployeeCount' }
      }
    }
  ]);
  
  return stats[0] || {
    totalJobTitles: 0,
    totalEmployees: 0,
    activeEmployees: 0
  };
};

/**
 * Static method to search job titles
 * @param {string} searchTerm - Search term
 * @returns {Promise<Array>} - Search results
 */
jobTitleSchema.statics.search = function(searchTerm) {
  const query = {
    isDeleted: { $ne: true }
  };
  
  if (searchTerm) {
    query.$or = [
      { title: { $regex: searchTerm, $options: 'i' } },
      { description: { $regex: searchTerm, $options: 'i' } }
    ];
  }
  
  return this.find(query).sort({ title: 1 });
};

/**
 * Static method to get most popular job titles
 * @param {number} limit - Number of results to return
 * @returns {Promise<Array>} - Most popular job titles
 */
jobTitleSchema.statics.getMostPopular = function(limit = 10) {
  return this.aggregate([
    {
      $match: { isDeleted: { $ne: true } }
    },
    {
      $lookup: {
        from: 'employees',
        localField: '_id',
        foreignField: 'jobTitle',
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
      $match: { employeeCount: { $gt: 0 } }
    },
    {
      $project: {
        title: 1,
        description: 1,
        employeeCount: 1
      }
    },
    {
      $sort: { employeeCount: -1, title: 1 }
    },
    {
      $limit: limit
    }
  ]);
};

const JobTitle = mongoose.model('JobTitle', jobTitleSchema);

module.exports = JobTitle;
