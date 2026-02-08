const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * User Schema - Authentication and Authorization
 * Handles user accounts with role-based access control
 */
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email address'
    ]
  },
  
  password: {
    type: String,
    required: function() {
      // Password is required only if not using OAuth
      return !this.googleId;
    },
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false // Don't include password in queries by default
  },
  
  // Google OAuth fields
  googleId: {
    type: String,
    sparse: true // Allow multiple null values but unique non-null values
  },
  
  profilePicture: {
    type: String,
    default: null
  },
  
  authProvider: {
    type: String,
    enum: ['local', 'google'],
    default: 'local'
  },
  
  emailVerified: {
    type: Boolean,
    default: false
  },
  
  role: {
    type: String,
    required: [true, 'Role is required'],
    enum: {
      values: ['Admin', 'HR', 'Viewer'],
      message: 'Role must be either Admin, HR, or Viewer'
    },
    default: 'Viewer'
  },
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  lastLogin: {
    type: Date,
    default: null
  },
  
  refreshTokens: [{
    token: String,
    createdAt: { type: Date, default: Date.now },
    expiresAt: Date
  }],
  
  passwordResetToken: {
    type: String,
    select: false
  },
  
  passwordResetExpires: {
    type: Date,
    select: false
  }
}, {
  timestamps: true, // Automatically add createdAt and updatedAt
  toJSON: {
    transform: function(doc, ret) {
      delete ret.password;
      delete ret.refreshTokens;
      delete ret.passwordResetToken;
      delete ret.passwordResetExpires;
      delete ret.__v;
      return ret;
    }
  }
});

/**
 * Indexes for performance - Remove duplicates
 */
// Only define indexes here, not in field definitions
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ googleId: 1 }, { sparse: true });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });

/**
 * Pre-save middleware to hash password before saving
 */
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new) and exists
  if (!this.isModified('password') || !this.password) return next();
  
  try {
    // Hash password with cost of 12
    this.password = await bcrypt.hash(this.password, 12);
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Instance method to check if password matches
 * @param {string} candidatePassword - The password to check
 * @returns {Promise<boolean>} - Returns true if passwords match
 */
userSchema.methods.correctPassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

/**
 * Instance method to compare password (alias for correctPassword)
 */
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

/**
 * Instance method to update last login time
 */
userSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date();
  return this.save({ validateBeforeSave: false });
};

/**
 * Instance method to update login info
 */
userSchema.methods.updateLoginInfo = function() {
  this.lastLogin = new Date();
  // Add login count if it doesn't exist
  if (typeof this.loginCount === 'undefined') {
    this.loginCount = 0;
  }
  this.loginCount += 1;
};

/**
 * Static method to find or create Google user
 */
userSchema.statics.findOrCreateGoogleUser = async function(googleUser) {
  try {
    // Check if user exists with Google ID
    let user = await this.findOne({ googleId: googleUser.googleId });
    
    if (user) {
      // Update profile picture if changed
      if (user.profilePicture !== googleUser.profilePicture) {
        user.profilePicture = googleUser.profilePicture;
        await user.save();
      }
      return user;
    }
    
    // Check if user exists with same email (account linking)
    user = await this.findOne({ email: googleUser.email });
    
    if (user) {
      // Link Google account to existing user
      user.googleId = googleUser.googleId;
      user.authProvider = 'google';
      user.profilePicture = googleUser.profilePicture;
      user.emailVerified = googleUser.emailVerified;
      await user.save();
      return user;
    }
    
    // Create new user
    const newUser = new this({
      googleId: googleUser.googleId,
      name: googleUser.name,
      email: googleUser.email,
      profilePicture: googleUser.profilePicture,
      authProvider: 'google',
      emailVerified: googleUser.emailVerified,
      role: 'Viewer', // Default role for new Google users
      isActive: true
    });
    
    await newUser.save();
    return newUser;
    
  } catch (error) {
    throw new Error(`Failed to find or create Google user: ${error.message}`);
  }
};

/**
 * Static method to find users by role
 * @param {string} role - The role to filter by
 * @returns {Promise<Array>} - Array of users with specified role
 */
userSchema.statics.findByRole = function(role) {
  return this.find({ role, isActive: true });
};

/**
 * Static method to get user statistics
 * @returns {Promise<Object>} - User statistics by role
 */
userSchema.statics.getStatistics = async function() {
  const stats = await this.aggregate([
    {
      $match: { isActive: true }
    },
    {
      $group: {
        _id: '$role',
        count: { $sum: 1 }
      }
    }
  ]);
  
  const result = {
    total: 0,
    Admin: 0,
    HR: 0,
    Viewer: 0
  };
  
  stats.forEach(stat => {
    result[stat._id] = stat.count;
    result.total += stat.count;
  });
  
  return result;
};

/**
 * Virtual to get user permissions based on role
 */
userSchema.virtual('permissions').get(function() {
  const rolePermissions = {
    Admin: [
      'users:create', 'users:read', 'users:update', 'users:delete',
      'employees:create', 'employees:read', 'employees:update', 'employees:delete',
      'departments:create', 'departments:read', 'departments:update', 'departments:delete',
      'jobTitles:create', 'jobTitles:read', 'jobTitles:update', 'jobTitles:delete',
      'attendance:create', 'attendance:read', 'attendance:update', 'attendance:delete',
      'dashboard:read', 'notifications:read'
    ],
    HR: [
      'employees:create', 'employees:read', 'employees:update',
      'departments:read', 'jobTitles:read',
      'attendance:create', 'attendance:read', 'attendance:update', 'attendance:delete',
      'dashboard:read', 'notifications:read'
    ],
    Viewer: [
      'employees:read', 'departments:read', 'jobTitles:read',
      'attendance:read', 'dashboard:read', 'notifications:read'
    ]
  };
  
  return rolePermissions[this.role] || [];
});

/**
 * Pre-remove middleware to handle user deletion
 */
userSchema.pre('remove', async function(next) {
  // Log user deletion
  console.log(`User ${this.email} is being deleted`);
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
